import { Injectable } from '@nestjs/common';
import { SuperAdminUserViewDto } from '../../dto/users/view/superadmin/sa.user.view.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserQueryDto } from '../../dto/users/query/user-query.dto';
import { Paginator } from '../../../helpers/pagination/_paginator';
import { filterUsers } from '../../../helpers/filters/filter-users';
import { BloggerUserBanQueryDto } from '../../dto/users/query/blogger/blogger.user-ban.query.dto';
import { filterUsersBannedByBlogger } from '../../../helpers/filters/filter-users-banned-by-blogger';
import { UsersBannedByBloggerViewDto } from '../../dto/users/view/blogger/blogger.user-ban.view.dto';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findUsers(
    query: UserQueryDto,
  ): Promise<Paginator<SuperAdminUserViewDto[]>> {
    const filter = filterUsers(
      query.banStatus,
      query.searchLoginTerm,
      query.searchEmailTerm,
    );

    const users = await this.dataSource.query(
      `select u.id,
              u.login,
              u.email,
              u."createdAt",
              u."isBanned",
              ub."banDate",
              ub."banReason"
       from public.users u
                left join public.user_bans_by_sa ub on u.id = ub."userId"
       where ("isBanned" = $1 or "isBanned" = $2)
         and (login ilike $3 or email ilike $4)
       order by "${query.sortBy}" ${query.sortDirection}
       limit ${query.pageSize} offset (${query.pageNumber} - 1) * ${query.pageSize}`,
      [filter.banStatus01, filter.banStatus02, filter.login, filter.email],
    );

    const totalCount = await this.dataSource.query(
      `select count(*)
       from public.users
       where ("isBanned" = $1 or "isBanned" = $2)
         and (login ilike $3 or email ilike $4);`,
      [filter.banStatus01, filter.banStatus02, filter.login, filter.email],
    );

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: Number(totalCount[0].count),
      items: await this.usersMapping(users),
    });
  }

  async findUsersBannedByBlogger(
    query: BloggerUserBanQueryDto,
    blogId: number,
  ): Promise<Paginator<UsersBannedByBloggerViewDto[]>> {
    const filter = filterUsersBannedByBlogger(query.searchLoginTerm);

    const users = await this.dataSource.query(
      `select u.id,
              u.login,
              u."isBannedByBlogger",
              ubbb."blogId",
              ubbb."banDate",
              ubbb."banReason"
       from public.users u
                left join user_bans_by_blogger ubbb on u.id = ubbb."userId"
       where "blogId" = $2
         and ("isBannedByBlogger" = true)
         and (login ilike $1)
       order by "${query.sortBy}" ${query.sortDirection}
       limit ${query.pageSize} offset (${query.pageNumber} - 1) * ${query.pageSize}`,
      [filter, blogId],
    );

    const totalCount = await this.dataSource.query(
      `select count(*)
       from public.users u
                left join user_bans_by_blogger ubbb on u.id = ubbb."userId"
       where "blogId" = $2
         and ("isBannedByBlogger" = true)
         and (login ilike $1)`,
      [filter, blogId],
    );

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: Number(totalCount[0].count),
      items: await this.usersBannedByBloggerMapping(users),
    });
  }

  async findUserById(id: number): Promise<SuperAdminUserViewDto> {
    const users = await this.dataSource.query(
      `select u.id,
              u.login,
              u.email,
              u."createdAt",
              u."isBanned",
              ub."banDate",
              ub."banReason"
       from public.users u
                left join public.user_bans_by_sa ub on u.id = ub."userId"
       where "userId" = $1`,
      [id],
    );

    const mappedUsers = await this.usersMapping(users);
    return mappedUsers[0];
  }

  private async usersMapping(array: any): Promise<SuperAdminUserViewDto[]> {
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

  private async usersBannedByBloggerMapping(
    array: any,
  ): Promise<UsersBannedByBloggerViewDto[]> {
    return array.map((u) => {
      return {
        id: u.id.toString(),
        login: u.login,
        banInfo: {
          isBanned: u.isBannedByBlogger,
          banDate: u.banDate,
          banReason: u.banReason,
        },
      };
    });
  }
}
