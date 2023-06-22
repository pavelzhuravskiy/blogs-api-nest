import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { User } from '../../../entities/users/user.entity';
import { UserPasswordRecovery } from '../../../entities/users/user-password-recovery.entity';
import { UserEmailConfirmation } from '../../../entities/users/user-email-confirmation.entity';
import { UserBanBySA } from '../../../entities/users/user-ban-by-sa.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(UserEmailConfirmation)
    private readonly userEmailConfirmationsRepository: Repository<UserEmailConfirmation>,
    @InjectRepository(UserPasswordRecovery)
    private readonly userPasswordRecoveriesRepository: Repository<UserPasswordRecovery>,
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
    entity: UserBanBySA | UserEmailConfirmation | UserPasswordRecovery,
  ): Promise<UserBanBySA | UserEmailConfirmation | UserPasswordRecovery> {
    return this.dataSource.manager.save(entity);
  }

  // ***** Unique login and email checks *****
  async checkLogin(login: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('u')
      .where(`u.login = :login`, { login: login })
      .getOne();
  }

  async checkEmail(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('u')
      .where(`u.email = :email`, { email: email })
      .getOne();
  }

  // ***** Find user operations *****
  async findUserById(userId: number): Promise<User | null> {
    try {
      return await this.usersRepository
        .createQueryBuilder('u')
        .where(`u.id = :userId`, { userId: userId })
        .getOne();
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findUserForEmailResend(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('u')
      .where(`u.email = :email`, {
        email: email,
      })
      .leftJoinAndSelect('u.userEmailConfirmation', 'uec')
      .getOne();
  }

  async findUserForEmailConfirm(
    confirmationCode: string,
  ): Promise<User | null> {
    try {
      return await this.usersRepository
        .createQueryBuilder('u')
        .where(`uec.confirmationCode = :confirmationCode`, {
          confirmationCode: confirmationCode,
        })
        .leftJoinAndSelect('u.userEmailConfirmation', 'uec')
        .getOne();
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async findUserForPasswordRecovery(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('u')
      .where(`u.email = :email`, {
        email: email,
      })
      .getOne();
  }

  async findUserForPasswordUpdate(recoveryCode: string): Promise<User | null> {
    try {
      return await this.usersRepository
        .createQueryBuilder('u')
        .where(`upr.recoveryCode = :recoveryCode`, {
          recoveryCode: recoveryCode,
        })
        .leftJoinAndSelect('u.userPasswordRecovery', 'upr')
        .getOne();
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async findUserForLoginValidation(loginOrEmail: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('u')
      .where(`u.login = :loginOrEmail OR u.email = :loginOrEmail`, {
        loginOrEmail: loginOrEmail,
      })
      .leftJoinAndSelect('u.userBanBySA', 'ubsa')
      .getOne();
  }

  async findUserForBan(userId: string): Promise<User | null> {
    try {
      return await this.usersRepository
        .createQueryBuilder('u')
        .where(`u.id = :userId`, { userId: userId })
        .leftJoinAndSelect('u.userBanBySA', 'ubsa')
        .getOne();
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  // ***** Delete operations *****
  async deleteUser(userId: number): Promise<boolean> {
    const result = await this.usersRepository
      .createQueryBuilder('u')
      .delete()
      .from(User)
      .where('id = :userId', { userId: userId })
      .execute();
    return result.affected === 1;
  }

  async deleteEmailConfirmationRecord(userId: number): Promise<boolean> {
    const result = await this.userEmailConfirmationsRepository
      .createQueryBuilder('uec')
      .delete()
      .from(UserEmailConfirmation)
      .where('userId = :userId', { userId: userId })
      .execute();
    return result.affected === 1;
  }

  async deletePasswordRecoveryRecord(userId: number): Promise<boolean> {
    const result = await this.userPasswordRecoveriesRepository
      .createQueryBuilder('upr')
      .delete()
      .from(UserPasswordRecovery)
      .where('userId = :userId', { userId: userId })
      .execute();
    return result.affected === 1;
  }

  // ---------------------------------------

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
