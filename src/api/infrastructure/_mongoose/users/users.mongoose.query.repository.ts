import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Paginator } from '../../../../helpers/pagination/_paginator';
import {
  UserModelType,
  UserMongoose,
} from '../../../entities/_mongoose/user.entity';
import { pFind } from '../../../../helpers/pagination/mongoose/pagination-find';
import { pSort } from '../../../../helpers/pagination/mongoose/pagination-sort';
import { BloggerUserBanQueryDto } from '../../../dto/users/query/blogger/blogger.user-ban.query.dto';
import { UsersBannedByBloggerViewDto } from '../../../dto/users/view/blogger/blogger.user-ban.view.dto';
import { pFilterUsersBannedByBlogger } from '../../../../helpers/pagination/mongoose/pagination-filter-users-banned-by-blogger';
import { BlogsRepository } from '../../blogs/blogs.repository';
import { ResultCode } from '../../../../enums/result-code.enum';
import {
  blogIDField,
  blogNotFound,
} from '../../../../exceptions/exception.constants';
import { ExceptionResultType } from '../../../../exceptions/types/exception-result.type';

@Injectable()
export class UsersMongooseQueryRepository {
  constructor(
    @InjectModel(UserMongoose.name)
    private UserModel: UserModelType,
    private readonly blogsRepository: BlogsRepository,
  ) {}

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
