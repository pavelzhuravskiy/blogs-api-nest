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
    const loginTerm = query.searchLoginTerm;
    const emailTerm = query.searchEmailTerm;
    const sortBy = query.sortBy || 'accountData.createdAt';
    const sortDirection = query.sortDirection;
    const pageNumber = Number(query.pageNumber) || 1;
    const pageSize = Number(query.pageSize) || 10;

    const filter: FilterQuery<UserDocument> = {};

    if (loginTerm || emailTerm) {
      filter.$or = [];

      if (loginTerm) {
        filter.$or.push({
          'accountData.login': { $regex: loginTerm, $options: 'i' },
        });
      }

      if (emailTerm) {
        filter.$or.push({
          'accountData.email': { $regex: emailTerm, $options: 'i' },
        });
      }
    }

    const sortingObj: { [key: string]: SortOrder } = {
      [`accountData.${sortBy}`]: 'desc',
    };

    if (sortDirection === 'asc') {
      sortingObj[`accountData.${sortBy}`] = 'asc';
    }

    const users = await this.UserModel.find(filter)
      .sort(sortingObj)
      .skip(pageNumber > 0 ? (pageNumber - 1) * pageSize : 0)
      .limit(pageSize > 0 ? pageSize : 0)
      .lean();

    const totalCount = await this.UserModel.countDocuments(filter);
    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
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
