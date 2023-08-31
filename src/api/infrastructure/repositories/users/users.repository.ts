import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities/users/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
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
  async findUserById(userId: string): Promise<User | null> {
    try {
      return await this.usersRepository
        .createQueryBuilder('u')
        .where(`u.id = :userId`, { userId: userId })
        .getOne();
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async findUserForEmailResend(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.userEmailConfirmation', 'uec')
      .where(`u.email = :email`, {
        email: email,
      })
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
      .leftJoinAndSelect('u.userBanBySA', 'ubsa')
      .where(`u.login = :loginOrEmail OR u.email = :loginOrEmail`, {
        loginOrEmail: loginOrEmail,
      })
      .getOne();
  }

  async findUserForBanByBlogger(userId: string): Promise<User | null> {
    try {
      return await this.usersRepository
        .createQueryBuilder('u')
        .leftJoinAndSelect('u.userBanByBlogger', 'ubb')
        .where(`u.id = :userId`, { userId: userId })
        .getOne();
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  // ***** Delete user *****
  async deleteUser(userId: string): Promise<boolean> {
    const result = await this.usersRepository
      .createQueryBuilder('u')
      .delete()
      .from(User)
      .where('id = :userId', { userId: userId })
      .execute();
    return result.affected === 1;
  }
}
