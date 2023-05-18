import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Paginator } from '../../../../../helpers/pagination/_paginator';
import { User, UserLeanType, UserModelType } from '../../../user.entity';
import { UserQueryDto } from '../dto/user-query.dto';
import { SuperAdminUserViewDto } from '../dto/user-view.dto';
import { pFind } from '../../../../../helpers/pagination/pagination-find';
import { pSort } from '../../../../../helpers/pagination/pagination-sort';
import { pFilterUsers } from '../../../../../helpers/pagination/pagination-filter-users';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}
  async findUsers(
    query: UserQueryDto,
  ): Promise<Paginator<SuperAdminUserViewDto[]>> {
    const users = await pFind(
      this.UserModel,
      query.pageNumber,
      query.pageSize,
      pFilterUsers(
        query.banStatus,
        query.searchLoginTerm,
        query.searchEmailTerm,
      ),
      pSort(`accountData.${query.sortBy}`, query.sortDirection),
    );

    const totalCount = await this.UserModel.countDocuments(
      pFilterUsers(
        query.banStatus,
        query.searchLoginTerm,
        query.searchEmailTerm,
      ),
    );

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: await this.usersMapping(users),
    });
  }

  async findUser(id: string): Promise<SuperAdminUserViewDto | null> {
    if (!mongoose.isValidObjectId(id)) {
      return null;
    }

    const user = await this.UserModel.findOne({ _id: id });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      login: user.accountData.login,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt,
      banInfo: {
        isBanned: user.banInfo.isBanned,
        banDate: user.banInfo.banDate,
        banReason: user.banInfo.banReason,
      },
    };
  }

  private async usersMapping(
    users: UserLeanType[],
  ): Promise<SuperAdminUserViewDto[]> {
    return users.map((u) => {
      return {
        id: u._id.toString(),
        login: u.accountData.login,
        email: u.accountData.email,
        createdAt: u.accountData.createdAt,
        banInfo: {
          isBanned: u.banInfo.isBanned,
          banDate: u.banInfo.banDate,
          banReason: u.banInfo.banReason,
        },
      };
    });
  }
}
