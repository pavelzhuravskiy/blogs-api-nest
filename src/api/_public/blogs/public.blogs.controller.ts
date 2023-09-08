import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogQueryDto } from '../../dto/blogs/query/blog.query.dto';
import { exceptionHandler } from '../../../exceptions/exception.handler';
import {
  blogIDField,
  blogNotFound,
} from '../../../exceptions/exception.constants';
import { ResultCode } from '../../../enums/result-code.enum';
import { BlogsQueryRepository } from '../../infrastructure/repositories/blogs/blogs.query.repository';
import { PostQueryDto } from '../../dto/posts/query/post.query.dto';
import { UserIdFromHeaders } from '../../_auth/decorators/user-id-from-headers.decorator';
import { PostsQueryRepository } from '../../infrastructure/repositories/posts/posts.query.repository';
import { JwtBearerGuard } from '../../_auth/guards/jwt-bearer.guard';
import { UserIdFromGuard } from '../../_auth/decorators/user-id-from-guard.decorator';
import { CommandBus } from '@nestjs/cqrs';
import { BlogSubscribeCommand } from './application/use-cases/blog-subscribe.use-case';
import { BlogUnsubscribeCommand } from './application/use-cases/blog-unsubscribe.use-case';

@Controller('blogs')
export class PublicBlogsController {
  constructor(
    private commandBus: CommandBus,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  async findBlogs(
    @Query() query: BlogQueryDto,
    @UserIdFromHeaders() userId: string,
  ) {
    return this.blogsQueryRepository.findBlogsForPublicUser(query, userId);
  }

  @Get(':id')
  async findBlog(
    @Param('id') blogId: string,
    @UserIdFromHeaders() userId: string,
  ) {
    const result = await this.blogsQueryRepository.findBlog(blogId, userId);

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIDField);
    }

    return result;
  }

  @Get(':id/posts')
  async findPostsForBlog(
    @Query() query: PostQueryDto,
    @Param('id') blogId: string,
    @UserIdFromHeaders() userId: string,
  ) {
    const result = await this.postsQueryRepository.findPostsForBlog(
      query,
      blogId,
      userId,
    );

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIDField);
    }

    return result;
  }

  @UseGuards(JwtBearerGuard)
  @Post(':id/subscription')
  @HttpCode(204)
  async subscribeToBlog(
    @Param('id') blogId: string,
    @UserIdFromGuard() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new BlogSubscribeCommand(blogId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @UseGuards(JwtBearerGuard)
  @Delete(':id/subscription')
  @HttpCode(204)
  async unsubscribeFromBlog(
    @Param('id') blogId: string,
    @UserIdFromGuard() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new BlogUnsubscribeCommand(blogId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }
}
