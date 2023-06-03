import { Injectable } from '@nestjs/common';
import { SuperAdminUserViewDto } from '../../dto/users/view/superadmin/sa.user.view.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findUserById(id: number): Promise<SuperAdminUserViewDto> {
    const users = await this.dataSource.query(
      `select u.id,
              u.login,
              u.email,
              u."createdAt",
              ub."isBanned",
              ub."banDate",
              ub."banReason"
       from public.users u
                left join user_bans ub on u.id = ub."userId"
       where "userId" = $1`,
      [id],
    );

    const mappedUsers = await this.usersMapping(users);
    return mappedUsers[0];
  }

  private async usersMapping(array: any): Promise<SuperAdminUserViewDto> {
    return array.map((u) => {
      return {
        id: u.id.toString(),
        login: u.login,
        email: u.email,
        createdAt: u.createdAt,
        banInfo: {
          isBanned: u.isBanned,
          banDate: u.banDate,
          banReason: u.banReason,
        },
      };
    });
  }
}
