import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { User } from '../../../entities/users/user.entity';
import { uuidIsValid } from '../../../../helpers/uuid-is-valid';
import { UserPasswordRecovery } from '../../../entities/users/user-password-recovery.entity';
import { UserEmailConfirmation } from '../../../entities/users/user-email-confirmation.entity';
import { UserBanBySA } from '../../../entities/users/user-ban-by-sa.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserBanBySA)
    private readonly userBanBySARepository: Repository<UserBanBySA>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  // ***** TypeORM query runner transaction SAVE *****

  async queryRunnerSave(
    entity: User | UserBanBySA | UserEmailConfirmation,
    queryRunnerManager: EntityManager,
  ): Promise<User | UserBanBySA | UserEmailConfirmation> {
    return queryRunnerManager.save(entity);
  }

  // ***** TypeORM data source manager SAVE *****

  async dataSourceSave(
    entity: UserEmailConfirmation,
  ): Promise<UserEmailConfirmation> {
    return this.dataSource.manager.save(entity);
  }

  // ***** Unique login and email checks *****

  async checkLogin(login: string): Promise<User | null> {
    return this.userRepository.findOneBy({ login: login });
  }

  async checkEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email: email });
  }

  // ***** Find user operations *****

  async findUserById(userId: number): Promise<User | null> {
    try {
      return await this.userRepository.findOneBy({ id: userId });
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findUserForEmailResend(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email },
      relations: { userEmailConfirmation: true },
    });
  }

  // ***** Delete operations *****

  async deleteUser(userId: number): Promise<boolean> {
    const result = await this.userRepository
      .createQueryBuilder('u')
      .delete()
      .from(User)
      .where('id = :userId', { userId: userId })
      .execute();
    return result.affected === 1;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const users = await this.dataSource.query(
      `select id, email, login
       from public.users
       where email = $1`,
      [email],
    );

    if (users.length === 0) {
      return null;
    }

    return users[0];
  }

  async findUserForLoginValidation(loginOrEmail: string): Promise<User | null> {
    const users = await this.dataSource.query(
      `select id, "passwordHash", "isConfirmed", "isBanned"
       from public.users
       where login = $1
          or email = $1;`,
      [loginOrEmail],
    );

    if (users.length === 0) {
      return null;
    }

    return users[0];
  }

  async findUserForEmailConfirm(
    code: string,
  ): Promise<(User & UserEmailConfirmation) | null> {
    if (!uuidIsValid(code)) {
      return null;
    }

    const users = await this.dataSource.query(
      `select u.id,
              u."isConfirmed",
              uec."confirmationCode",
              uec."expirationDate"
       from public.users u
                left join public.user_email_confirmations uec
                          on u.id = uec."userId"
       where uec."confirmationCode" = $1`,
      [code],
    );

    if (users.length === 0) {
      return null;
    }

    return users[0];
  }

  async findPasswordRecoveryRecord(
    code: string,
  ): Promise<UserPasswordRecovery> {
    if (!uuidIsValid(code)) {
      return null;
    }

    const users = await this.dataSource.query(
      `select *
       from user_password_recoveries
       where "recoveryCode" = $1`,
      [code],
    );

    if (users.length === 0) {
      return null;
    }

    return users[0];
  }

  async confirmUser(userId: number): Promise<boolean> {
    return this.dataSource.transaction(async () => {
      await this.dataSource.query(
        `update public.users
         set "isConfirmed" = true
         where id = $1`,
        [userId],
      );

      const result = await this.dataSource.query(
        `delete
         from public.user_email_confirmations
         where "userId" = $1;`,
        [userId],
      );
      return result[1] === 1;
    });
  }

  async createPasswordRecoveryRecord(
    recoveryCode: string,
    userId: number,
  ): Promise<number> {
    const result = await this.dataSource.query(
      `insert into public.user_password_recoveries("userId", "recoveryCode", "expirationDate") 
       values ($1, $2, now() + interval '3 hours') returning id;`,
      [userId, recoveryCode],
    );

    return result[0].id;
  }

  async updatePassword(userId: number, hash: string): Promise<boolean> {
    return this.dataSource.transaction(async () => {
      await this.dataSource.query(
        `update public.users
         set "passwordHash" = $2
         where id = $1`,
        [userId, hash],
      );

      const result = await this.dataSource.query(
        `delete
         from public.user_password_recoveries
         where "userId" = $1;`,
        [userId],
      );
      return result[1] === 1;
    });
  }

  async banUserBySA(userId: number, banReason: string): Promise<boolean> {
    return this.dataSource.transaction(async () => {
      await this.dataSource.query(
        `update public.users
         set "isBanned" = true
         where id = $1`,
        [userId],
      );

      const result = await this.dataSource.query(
        `update public.user_bans_by_sa
         set "banDate" = now(),
             "banReason"   = $2
         where "userId" = $1`,
        [userId, banReason],
      );
      return result[1] === 1;
    });
  }

  async unbanUserBySA(userId: number): Promise<boolean> {
    return this.dataSource.transaction(async () => {
      await this.dataSource.query(
        `update public.users
         set "isBanned" = false
         where id = $1`,
        [userId],
      );

      const result = await this.dataSource.query(
        `update public.user_bans_by_sa
         set "banDate" = null,
             "banReason"   = null
         where "userId" = $1`,
        [userId],
      );
      return result[1] === 1;
    });
  }

  async findUserBanForBlog(
    userId: number,
    blogId: number,
  ): Promise<User[] | null> {
    const users = await this.dataSource.query(
      `select u.id
       from public.users u
                left join user_bans_by_blogger ubbb on u.id = ubbb."userId"
       where u.id = $1
         and u."isBannedByBlogger" = true
         and ubbb."blogId" = $2`,
      [userId, blogId],
    );

    if (users.length === 0) {
      return null;
    }

    return users;
  }

  async banUserByBlogger(
    userId: number,
    blogId: number,
    banReason: string,
  ): Promise<number> {
    return this.dataSource.transaction(async () => {
      await this.dataSource.query(
        `update public.users
         set "isBannedByBlogger" = true
         where id = $1`,
        [userId],
      );

      const result = await this.dataSource.query(
        `insert into user_bans_by_blogger ("userId", "blogId", "banDate", "banReason")
         values ($1, $2, now(), $3) returning id`,
        [userId, blogId, banReason],
      );
      return result[0].id;
    });
  }

  async unbanUserByBlogger(userId: number, blogId: number): Promise<boolean> {
    return this.dataSource.transaction(async () => {
      await this.dataSource.query(
        `update public.users
         set "isBannedByBlogger" = false
         where id = $1`,
        [userId],
      );

      const result = await this.dataSource.query(
        `delete
         from public.user_bans_by_blogger
         where "userId" = $1 and "blogId" = $2;`,
        [userId, blogId],
      );
      return result[0].id;
    });
  }
}
