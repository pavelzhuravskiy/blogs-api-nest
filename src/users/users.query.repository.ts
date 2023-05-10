import { Injectable } from '@nestjs/common';
import { FilterQuery, SortOrder } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Paginator } from '../common/schemas/paginator';
import { User, UserDocument, UserModelType } from './schemas/user.entity';
import { UserQuery } from './dto/user.query';
import { UserViewModel } from './schemas/user.view';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}
  async findUsers(query: UserQuery): Promise<Paginator<UserViewModel[]>> {
    const filter: FilterQuery<UserDocument> = {};

    if (query.searchLoginTerm || query.searchEmailTerm) {
      filter.$or = [];

      if (query.searchLoginTerm) {
        filter.$or.push({
          'accountData.login': { $regex: query.searchLoginTerm, $options: 'i' },
        });
      }

      if (query.searchEmailTerm) {
        filter.$or.push({
          'accountData.email': { $regex: query.searchEmailTerm, $options: 'i' },
        });
      }
    }

    const sortingObj: { [key: string]: SortOrder } = {
      [`accountData.${query.sortBy}`]: query.sortDirection,
    };

    if (query.sortDirection === 'asc') {
      sortingObj[`accountData.${query.sortBy}`] = 'asc';
    }

    const users = await this.UserModel.find(filter)
      .sort(sortingObj)
      .skip(query.pageNumber > 0 ? (query.pageNumber - 1) * query.pageSize : 0)
      .limit(query.pageSize > 0 ? query.pageSize : 0)
      .lean();

    const totalCount = await this.UserModel.countDocuments(filter);
    const pagesCount = Math.ceil(totalCount / query.pageSize);

    return {
      pagesCount: pagesCount,
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
      items: users.map((user) => {
        return {
          id: user._id.toString(),
          login: user.accountData.login,
          email: user.accountData.email,
          createdAt: user.accountData.createdAt.toISOString(),
        };
      }),
    };
  }
}
