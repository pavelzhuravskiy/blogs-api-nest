import { Injectable } from '@nestjs/common';
import { UserInputDto } from '../../dto/users/input/user-input.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from '../../entities/users/user.entity';

@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async checkUserExistence(userId: number): Promise<User> {
    const users = await this.dataSource.query(
      `select id
       from public.users
       where id = $1`,
      [userId],
    );
    return users[0];
  }

  async findExistingLogin(login: string): Promise<User | null> {
    const users = await this.dataSource.query(
      `select id
       from public.users
       where login = $1`,
      [login],
    );

    if (users.length === 0) {
      return null;
    }

    return users;
  }

  async findExistingEmail(email: string): Promise<User | null> {
    const users = await this.dataSource.query(
      `select id
       from public.users
       where email = $1`,
      [email],
    );

    if (users.length === 0) {
      return null;
    }

    return users;
  }

  async createUser(userInputDto: UserInputDto, hash: string): Promise<number> {
    return this.dataSource.transaction(async () => {
      const user = await this.dataSource.query(
        `insert into public.users (login, "passwordHash", email, "isConfirmed",
                                   "isBanned")
         values ($1, $2, $3, $4, $5)
         returning id;`,
        [userInputDto.login, hash, userInputDto.email, true, false],
      );

      const userId = user[0].id;

      await this.dataSource.query(
        `insert into public.user_bans ("userId")
         values ($1);`,
        [userId],
      );

      return userId;
    });
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
        `insert into public.user_bans ("userId")
         values ($1);`,
        [userId],
      );

      await this.dataSource.query(
        `insert into public.user_email_confirmations ("userId",
                                                      "confirmationCode",
                                                      "expirationDate")
         values ($1, $2, current_timestamp + interval '3 hours');`,
        [userId, confirmationCode],
      );

      return userId;
    });
  }

  async deleteUser(userId: number): Promise<boolean> {
    const result = await this.dataSource.query(
      `delete
       from public.users
       where id = $1;`,
      [userId],
    );
    return result[1] === 1;
  }
}
