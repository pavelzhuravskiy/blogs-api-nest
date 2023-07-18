import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ExceptionResultType } from '../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../enums/result-code.enum';
import {
  blogIDField,
  blogNotFound,
} from '../../../../exceptions/exception.constants';
import { BlogsRepository } from '../../../infrastructure/repositories/blogs/blogs.repository';
import { BloggerUserBanQueryDto } from '../../../dto/users/query/blogger/blogger.user-ban.query.dto';
import { UsersQueryRepository } from '../../../infrastructure/repositories/users/users.query.repository';

export class UsersGetBannedQuery {
  constructor(
    public bloggerUserBanQueryDto: BloggerUserBanQueryDto,
    public blogId: string,
    public userId: string,
  ) {}
}

@QueryHandler(UsersGetBannedQuery)
export class UsersGetBannedUseCase
  implements IQueryHandler<UsersGetBannedQuery>
{
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(
    query: UsersGetBannedQuery,
  ): Promise<ExceptionResultType<boolean>> {
    const blog = await this.blogsRepository.findBlogWithOwner(query.blogId);

    if (!blog) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: blogIDField,
        message: blogNotFound,
      };
    }

    if (blog.user.id !== query.userId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    const response = await this.usersQueryRepository.findUsersBannedByBlogger(
      query.bloggerUserBanQueryDto,
      blog.id,
    );

    return {
      data: true,
      code: ResultCode.Success,
      response: response,
    };
  }
}
