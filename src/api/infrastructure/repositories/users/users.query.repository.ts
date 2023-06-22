import { Injectable } from '@nestjs/common';
import { SuperAdminUserViewDto } from '../../../dto/users/view/superadmin/sa.user.view.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserQueryDto } from '../../../dto/users/query/user-query.dto';
import { Paginator } from '../../../../helpers/paginator';
import { BloggerUserBanQueryDto } from '../../../dto/users/query/blogger/blogger.user-ban.query.dto';
import { filterUsersBannedByBlogger } from '../../../../helpers/filters/filter-users-banned-by-blogger';
import { UsersBannedByBloggerViewDto } from '../../../dto/users/view/blogger/blogger.user-ban.view.dto';
import { User } from '../../../entities/users/user.entity';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async findUserById(userId: number): Promise<SuperAdminUserViewDto> {
    const users = await this.usersRepository
      .createQueryBuilder('u')
      .where(`u.id = :userId`, {
        userId: userId,
      })
      .leftJoinAndSelect('u.userBanBySA', 'ubsa')
      .getMany();

    const mappedUsers = await this.usersMapping(users);
    return mappedUsers[0];
  }

  async findUsers(
    query: UserQueryDto,
  ): Promise<Paginator<SuperAdminUserViewDto[]>> {
    const users = await this.usersRepository
      .createQueryBuilder('u')
      .where(
        `${
          query.banStatus === true || query.banStatus === false
            ? 'ubsa.isBanned = :banStatus'
            : 'ubsa.isBanned is not null'
        }`,
        { banStatus: query.banStatus },
      )
      .andWhere(
        `${
          query.searchLoginTerm || query.searchEmailTerm
            ? `(u.login ilike :loginTerm OR u.email ilike :emailTerm)`
            : 'u.login is not null'
        }`,
        {
          loginTerm: `%${query.searchLoginTerm}%`,
          emailTerm: `%${query.searchEmailTerm}%`,
        },
      )
      .leftJoinAndSelect('u.userBanBySA', 'ubsa')
      .orderBy(`u.${query.sortBy}`, query.sortDirection)
      .skip((query.pageNumber - 1) * query.pageSize)
      .take(query.pageSize)
      .getMany();

    const totalCount = await this.usersRepository
      .createQueryBuilder('u')
      .where(
        `${
          query.banStatus === true || query.banStatus === false
            ? 'ubsa.isBanned = :banStatus'
            : 'ubsa.isBanned is not null'
        }`,
        { banStatus: query.banStatus },
      )
      .andWhere(
        `${
          query.searchLoginTerm || query.searchEmailTerm
            ? `(u.login ilike :loginTerm OR u.email ilike :emailTerm)`
            : 'u.login is not null'
        }`,
        {
          loginTerm: `%${query.searchLoginTerm}%`,
          emailTerm: `%${query.searchEmailTerm}%`,
        },
      )
      .leftJoinAndSelect('u.userBanBySA', 'ubsa')
      .getCount();

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
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
                left join public.user_bans_by_blogger ubbb on u.id = ubbb."userId"
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
                left join public.user_bans_by_blogger ubbb on u.id = ubbb."userId"
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

  private async usersMapping(array: User[]): Promise<SuperAdminUserViewDto[]> {
    return array.map((u) => {
      return {
        id: u.id.toString(),
        login: u.login,
        email: u.email,
        createdAt: u.createdAt,
        banInfo: {
          isBanned: u.userBanBySA.isBanned,
          banDate: u.userBanBySA.banDate,
          banReason: u.userBanBySA.banReason,
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
