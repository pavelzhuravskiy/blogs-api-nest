import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query.repository';
import { BlogQueryDto } from '../../dto/blog.query.dto';
import { Role } from '../../../../enums/role.enum';
import { QueryDto } from 'src/features/_shared/dto/query.dto';
import { PostsQueryRepository } from '../../../posts/infrastructure/posts.query.repository';
import { UserIdFromHeaders } from '../../../auth/decorators/user-id-from-headers.decorator';
import { exceptionHandler } from '../../../../exceptions/exception.handler';
import {
  blogIDField,
  blogNotFound,
} from '../../../../exceptions/exception.constants';
import { ResultCode } from '../../../../enums/result-code.enum';
import { BlogsFindNotBannedCommand } from '../superadmin/application/use-cases/blogs-find-not-banned-use.case';
import { CommandBus } from '@nestjs/cqrs';
import { UsersFindNotBannedCommand } from '../../../users/api/superadmin/application/use-cases/users-find-not-banned-use.case';

@Controller('blogs')
export class PublicBlogsController {
  constructor(
    private commandBus: CommandBus,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  async findBlogs(@Query() query: BlogQueryDto) {
    const role = Role.User;
    return this.blogsQueryRepository.findBlogs(query, role);
  }

  @Get(':id')
  async findBlog(@Param('id') id) {
    const result = await this.blogsQueryRepository.findBlog(id);

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIDField);
    }

    return result;
  }

  @Get(':id/posts')
  async findPosts(
    @Query() query: QueryDto,
    @Param('id') blogId,
    @UserIdFromHeaders() userId,
  ) {
    const blogsNotBanned = await this.commandBus.execute(
      new BlogsFindNotBannedCommand(),
    );

    const usersNotBanned = await this.commandBus.execute(
      new UsersFindNotBannedCommand(),
    );

    const result = await this.postsQueryRepository.findPosts(
      blogsNotBanned,
      usersNotBanned,
      query,
      userId,
      blogId,
    );

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIDField);
    }

    return result;
  }
}
