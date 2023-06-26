import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { User } from '../../../entities/users/user.entity';
import { UserPasswordRecovery } from '../../../entities/users/user-password-recovery.entity';
import { UserEmailConfirmation } from '../../../entities/users/user-email-confirmation.entity';
import { UserBanBySA } from '../../../entities/users/user-ban-by-sa.entity';
import { UserBanByBlogger } from '../../../entities/users/user-ban-by-blogger.entity';

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
    entity:
      | UserBanBySA
      | UserBanByBlogger
      | UserEmailConfirmation
      | UserPasswordRecovery,
  ): Promise<
    | UserBanBySA
    | UserBanByBlogger
    | UserEmailConfirmation
    | UserPasswordRecovery
  > {
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

  async findUserForBanBySA(userId: string): Promise<User | null> {
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

  async findUserForBanByBlogger(userId: string | number): Promise<User | null> {
    try {
      return await this.usersRepository
        .createQueryBuilder('u')
        .where(`u.id = :userId`, { userId: userId })
        .leftJoinAndSelect('u.userBanByBlogger', 'ubb')
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
}
