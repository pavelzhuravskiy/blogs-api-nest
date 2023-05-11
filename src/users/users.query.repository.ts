import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Paginator } from '../common/schemas/paginator';
import { User, UserLeanType, UserModelType } from './schemas/user.entity';
import { UserQueryDto } from './dto/user-query.dto';
import { UserViewModel } from './schemas/user.view';
import { pFind } from '../helpers/pagination/pagination-find';
import { pSort } from '../helpers/pagination/pagination-sort';
import { pFilterUsers } from '../helpers/pagination/pagination-filter-users';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}
  async findUsers(query: UserQueryDto): Promise<Paginator<UserViewModel[]>> {
    const users = await pFind(
      this.UserModel,
      query.pageNumber,
      query.pageSize,
      pFilterUsers(query.searchLoginTerm, query.searchEmailTerm),
      pSort(`accountData.${query.sortBy}`, query.sortDirection),
    );

    const totalCount = await this.UserModel.countDocuments(
      pFilterUsers(query.searchLoginTerm, query.searchEmailTerm),
    );

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: await this.usersMapping(users),
    });
  }

  async findUser(id: string): Promise<UserViewModel | null> {
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
      createdAt: user.accountData.createdAt.toISOString(),
    };
  }

  private async usersMapping(users: UserLeanType[]): Promise<UserViewModel[]> {
    return users.map((u) => {
      return {
        id: u._id.toString(),
        login: u.accountData.login,
        email: u.accountData.email,
        createdAt: u.accountData.createdAt.toISOString(),
      };
    });
  }
}
