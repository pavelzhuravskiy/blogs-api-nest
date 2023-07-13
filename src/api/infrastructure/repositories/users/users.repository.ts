import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../../../entities/users/user.entity';
import { UserPasswordRecovery } from '../../../entities/users/user-password-recovery.entity';
import { UserEmailConfirmation } from '../../../entities/users/user-email-confirmation.entity';

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

  async findUserForPasswordRecovery(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('u')
      .where(`u.email = :email`, {
        email: email,
      })
      .getOne();
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

  // ***** Delete user *****
  async deleteUser(userId: number): Promise<boolean> {
    const result = await this.usersRepository
      .createQueryBuilder('u')
      .delete()
      .from(User)
      .where('id = :userId', { userId: userId })
      .execute();
    return result.affected === 1;
  }
}
