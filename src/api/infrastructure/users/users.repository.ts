import { Injectable } from '@nestjs/common';
import { UserInputDto } from '../../dto/users/input/user-input.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from '../../entities/users/user.entity';
import { uuidIsValid } from '../../../helpers/uuid-is-valid';
import { UserPasswordRecovery } from '../../entities/users/user-password-recovery.entity';
import { UserEmailConfirmation } from '../../entities/users/user-email-confirmation.entity';

@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

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

      await this.dataSource.query(
        `insert into public.user_password_recoveries("userId", "recoveryCode",
                                                     "expirationDate")
         values ($1, null, null);`,
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
         values ($1, $2, now() + interval '3 hours');`,
        [userId, confirmationCode],
      );

      await this.dataSource.query(
        `insert into public.user_password_recoveries(
                                            "userId", "recoveryCode", "expirationDate")
         values ($1, null, null);`,
        [userId],
      );

      return userId;
    });
  }

  async findUserById(userId: number): Promise<User | null> {
    if (isNaN(+userId)) {
      return null;
    }

    const users = await this.dataSource.query(
      `select id, login, email, "isBanned"
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

  async findExistingLogin(login: string): Promise<User[] | null> {
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

  async findExistingEmail(email: string): Promise<User[] | null> {
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
        `update public.user_email_confirmations uec
         set "confirmationCode" = null,
             "expirationDate"   = null
         where "userId" = $1`,
        [userId],
      );
      return result[1] === 1;
    });
  }

  async updatePasswordRecoveryData(
    recoveryCode: string,
    userId: number,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `update public.user_password_recoveries upr 
       set "recoveryCode" = $1,
           "expirationDate"   = now() + interval '3 hours'
       where "userId" = $2`,
      [recoveryCode, userId],
    );
    return result[1] === 1;
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
        `update public.user_password_recoveries uec
         set "recoveryCode" = null,
             "expirationDate"   = null
         where "userId" = $1`,
        [userId],
      );
      return result[1] === 1;
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

  async banUser(userId: number, banReason: string): Promise<boolean> {
    return this.dataSource.transaction(async () => {
      await this.dataSource.query(
        `update public.users
         set "isBanned" = true
         where id = $1`,
        [userId],
      );

      const result = await this.dataSource.query(
        `update public.user_bans
         set "banDate" = now(),
             "banReason"   = $2
         where "userId" = $1`,
        [userId, banReason],
      );
      return result[1] === 1;
    });
  }

  async unbanUser(userId: number): Promise<boolean> {
    return this.dataSource.transaction(async () => {
      await this.dataSource.query(
        `update public.users
         set "isBanned" = false
         where id = $1`,
        [userId],
      );

      const result = await this.dataSource.query(
        `update public.user_bans
         set "banDate" = null,
             "banReason"   = null
         where "userId" = $1`,
        [userId],
      );
      return result[1] === 1;
    });
  }
}
