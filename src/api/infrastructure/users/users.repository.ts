import { Injectable } from '@nestjs/common';
import { UserInputDto } from '../../dto/users/input/user-input.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { User } from '../../entities/users/user.entity';
import { uuidIsValid } from '../../../helpers/uuid-is-valid';
import { UserPasswordRecovery } from '../../entities/users/user-password-recovery.entity';
import { UserEmailConfirmation } from '../../entities/users/user-email-confirmation.entity';
import { idIsValid } from '../../../helpers/id-is-valid';
import { UserBanBySA } from '../../entities/users/user-ban-by-sa.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserBanBySA)
    private readonly userBanBySARepository: Repository<UserBanBySA>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async save(
    entity: User | UserBanBySA,
    queryRunnerManager: EntityManager,
  ): Promise<User | UserBanBySA> {
    return queryRunnerManager.save(entity);
  }

  async findExistingLogin(login: string): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ login: login });

    if (!user) {
      return null;
    }

    return user;
  }

  async findExistingEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ email: email });

    if (!user) {
      return null;
    }

    return user;
  }

  async registerUser(
    userInputDto: UserInputDto,
    hash: string,
    confirmationCode: string,
  ): Promise<number> {
    return this.dataSource.transaction(async () => {
      const user = await this.dataSource.query(
        `insert into public.users (login,
                                   "passwordHash", email, "isConfirmed",
                                   "isBanned")
         values ($1, $2, $3, $4, $5)
         returning id;`,
        [userInputDto.login, hash, userInputDto.email, false, false],
      );
      const userId = user[0].id;

      await this.dataSource.query(
        `insert into public.user_bans_by_sa ("userId")
         values ($1);`,
        [userId],
      );

      await this.dataSource.query(
        `insert into public.user_email_confirmations ("userId",
                                                      "confirmationCode",
                                                      "expirationDate")
         values ($1, $2, now() + interval '3 hours');`,
        [userId, confirmationCode],
      );

      return userId;
    });
  }

  async findUserById(userId: number | string): Promise<User | null> {
    if (!idIsValid(userId)) {
      return null;
    }

    const users = await this.dataSource.query(
      `select id, login, email, "isBanned", "isBannedByBlogger"
       from public.users
       where id = $1`,
      [userId],
    );

    if (users.length === 0) {
      return null;
    }

    return users[0];
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

  async findUserForEmailResend(email: string): Promise<User | null> {
    const users = await this.dataSource.query(
      `select u.id, u.login, u.email, u."isConfirmed", uec."confirmationCode"
       from public.users u
                left join public.user_email_confirmations uec
                          on u.id = uec."userId"
       where email = $1`,
      [email],
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

  async updateEmailConfirmationData(
    confirmationCode: string,
    userId: number,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `update public.user_email_confirmations
       set "confirmationCode" = $1,
           "expirationDate"   = now() + interval '3 hours'
       where "userId" = $2`,
      [confirmationCode, userId],
    );
    return result[1] === 1;
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

  async deleteUser(userId: string | number): Promise<boolean> {
    const result = await this.dataSource.query(
      `delete
       from public.users
       where id = $1;`,
      [userId],
    );
    return result[1] === 1;
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
