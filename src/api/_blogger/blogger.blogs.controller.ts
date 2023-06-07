import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogInputDto } from '../dto/blogs/input/blog.input.dto';
import { CommandBus } from '@nestjs/cqrs';
import { BlogCreateCommand } from './application/use-cases/blog-create.use-case';
import { JwtBearerGuard } from '../_auth/guards/jwt-bearer.guard';
import { UserIdFromGuard } from '../_auth/decorators/user-id-from-guard.decorator';
import { exceptionHandler } from '../../exceptions/exception.handler';
import { ResultCode } from '../../enums/result-code.enum';
import {
  userIDField,
  userNotFound,
} from '../../exceptions/exception.constants';
import { BlogUpdateCommand } from './application/use-cases/blog-update.use-case';
import { BlogDeleteCommand } from './application/use-cases/blog-delete.use-case';
import { PostInputDto } from '../dto/posts/input/post.input.dto';
import { PostsQueryRepository } from '../infrastructure/posts/posts.query.repository';
import { PostUpdateCommand } from './application/use-cases/post-update.use-case';
import { PostCreateCommand } from './application/use-cases/post-create.use-case';
import { PostDeleteCommand } from './application/use-cases/post-delete.use-case';
import { QueryDto } from '../dto/query.dto';
import { CommentsQueryRepository } from '../infrastructure/comments/comments.query.repository';
import { BlogsQueryRepository } from '../infrastructure/blogs/blogs.query.repository';

@Controller('blogger/blogs')
export class BloggerBlogsController {
  constructor(
    private commandBus: CommandBus,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @UseGuards(JwtBearerGuard)
  @Post()
  async createBlog(
    @Body() blogInputDto: BlogInputDto,
    @UserIdFromGuard() userId,
  ) {
    const blogId = await this.commandBus.execute(
      new BlogCreateCommand(blogInputDto, userId),
    );

    if (!blogId) {
      return exceptionHandler(ResultCode.NotFound, userNotFound, userIDField);
    }

    return this.blogsQueryRepository.findBlog(blogId);
  }

  /*@UseGuards(JwtBearerGuard)
  @Get()
  async findBlogs(@Query() query: BlogQueryDto, @UserIdFromGuard() userId) {
    const role = Role.Blogger;
    return this.blogsQueryRepository.findBlogs(query, role, userId);
  }*/

  @UseGuards(JwtBearerGuard)
  @Put(':id')
  @HttpCode(204)
  async updateBlog(
    @Body() blogInputDto: BlogInputDto,
    @Param('id') blogId,
    @UserIdFromGuard() userId,
  ) {
    const result = await this.commandBus.execute(
      new BlogUpdateCommand(blogInputDto, blogId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @UseGuards(JwtBearerGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(@Param('id') blogId, @UserIdFromGuard() userId) {
    const result = await this.commandBus.execute(
      new BlogDeleteCommand(blogId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @UseGuards(JwtBearerGuard)
  @Post(':id/posts')
  async createPost(
    @Body() postInputDto: PostInputDto,
    @Param('id') blogId,
    @UserIdFromGuard() userId,
  ) {
    const result = await this.commandBus.execute(
      new PostCreateCommand(postInputDto, blogId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return this.postsQueryRepository.findPost(result.response);
  }

  @UseGuards(JwtBearerGuard)
  @Put(':blogId/posts/:postId')
  @HttpCode(204)
  async updatePost(
    @Body() postInputDto: PostInputDto,
    @Param() params,
    @UserIdFromGuard() userId,
  ) {
    const result = await this.commandBus.execute(
      new PostUpdateCommand(postInputDto, params.blogId, params.postId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @UseGuards(JwtBearerGuard)
  @Delete(':blogId/posts/:postId')
  @HttpCode(204)
  async deletePost(@Param() params, @UserIdFromGuard() userId) {
    const result = await this.commandBus.execute(
      new PostDeleteCommand(params.blogId, params.postId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @UseGuards(JwtBearerGuard)
  @Get('comments')
  async findComments(@Query() query: QueryDto, @UserIdFromGuard() userId) {
    return this.commentsQueryRepository.findCommentsOfBloggersPosts(
      query,
      userId,
    );
  }
}
