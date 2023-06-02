import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Paginator } from '../../../helpers/pagination/_paginator';
import {
  UserMongoose,
  UserLeanType,
  UserModelType,
} from '../../entities/_mongoose/user.entity';
import { UserQueryDto } from '../../dto/users/query/user-query.dto';
import { SuperAdminUserViewDto } from '../../dto/users/view/superadmin/sa.user.view.dto';
import { pFind } from '../../../helpers/pagination/pagination-find';
import { pSort } from '../../../helpers/pagination/pagination-sort';
import { pFilterUsersSA } from '../../../helpers/pagination/pagination-filter-users';
import { BloggerUserBanQueryDto } from '../../dto/users/query/blogger/blogger.user-ban.query.dto';
import { UsersBannedByBloggerViewDto } from '../../dto/users/view/blogger/blogger.user-ban.view.dto';
import { pFilterUsersBannedByBlogger } from '../../../helpers/pagination/pagination-filter-users-banned-by-blogger';
import { BlogsRepository } from '../blogs/blogs.repository';
import { ResultCode } from '../../../enums/result-code.enum';
import {
  blogIDField,
  blogNotFound,
} from '../../../exceptions/exception.constants';
import { ExceptionResultType } from '../../../exceptions/types/exception-result.type';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(UserMongoose.name)
    private UserModel: UserModelType,
    private readonly blogsRepository: BlogsRepository,
  ) {}
  async findUsersBySA(
    query: UserQueryDto,
  ): Promise<Paginator<SuperAdminUserViewDto[]>> {
    const users = await pFind(
      this.UserModel,
      query.pageNumber,
      query.pageSize,
      pFilterUsersSA(
        query.banStatus,
        query.searchLoginTerm,
        query.searchEmailTerm,
      ),
      pSort(`accountData.${query.sortBy}`, query.sortDirection),
    );

    const totalCount = await this.UserModel.countDocuments(
      pFilterUsersSA(
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

  async findUsersBannedByBlogger(
    query: BloggerUserBanQueryDto,
    blogId: string,
    userId: string,
  ): Promise<ExceptionResultType<boolean>> {
    const blog = await this.blogsRepository.findBlog(blogId);

    if (!blog) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: blogIDField,
        message: blogNotFound,
      };
    }

    if (userId !== blog.blogOwnerInfo.userId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
        field: blogIDField,
        message: blogNotFound,
      };
    }

    const users = await pFind(
      this.UserModel,
      query.pageNumber,
      query.pageSize,
      pFilterUsersBannedByBlogger(query.searchLoginTerm, blogId),
      pSort(`accountData.${query.sortBy}`, query.sortDirection),
    );

    const totalCount = await this.UserModel.countDocuments(
      pFilterUsersBannedByBlogger(query.searchLoginTerm, blogId),
    );

    const usersBannedByBlogger = users.map((u) => u.bansForBlogs[0]);

    const result = await Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: await this.usersBannedByBloggerMapping(usersBannedByBlogger),
    });

    return {
      data: true,
      code: ResultCode.Success,
      response: result,
    };
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

  private async usersBannedByBloggerMapping(
    users: any[],
  ): Promise<UsersBannedByBloggerViewDto[]> {
    return users.map((u) => {
      return {
        id: u.id,
        login: u.login,
        banInfo: {
          isBanned: u.banInfo.isBanned,
          banDate: u.banInfo.banDate,
          banReason: u.banInfo.banReason,
        },
      };
    });
  }
}
