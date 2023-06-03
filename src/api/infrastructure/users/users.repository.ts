import { Injectable } from '@nestjs/common';
import { UserInputDto } from '../../dto/users/input/user-input.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from '../../entities/users/user.entity';

@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createUser(userInputDto: UserInputDto, hash: string) {
    return await this.dataSource.transaction(async () => {
      const user = await this.dataSource.query(
        `insert into public.users (login, "passwordHash", email, "isConfirmed")
         values ($1, $2, $3, $4)
         returning id;`,
        [userInputDto.login, hash, userInputDto.email, true],
      );
      const userId = user[0].id;

      await this.dataSource.query(
        `insert into user_bans ("isBanned", "userId")
         values (false, $1);`,
        [userId],
      );
      return userId;
    });
  }

  async findUserById(id: string): Promise<User | null> {
    const user = await this.dataSource.query(
      `select *
       from public.users
       where id = $1;`,
      [id],
    );

    if (!user) {
      return null;
    }

    return user;
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
}
