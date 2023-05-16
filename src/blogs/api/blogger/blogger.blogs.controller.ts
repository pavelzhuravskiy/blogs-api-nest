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
import { BlogInputDto } from '../../dto/blog.input.dto';
import { CommandBus } from '@nestjs/cqrs';
import { BloggerCreateBlogCommand } from './application/use-cases/blogs/blogger.create-blog.use-case';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query.repository';
import { JwtBearerGuard } from '../../../auth/guards/jwt-bearer.guard';
import { UserIdFromGuard } from '../../../auth/decorators/user-id-from-guard.decorator';
import { exceptionHandler } from '../../../exceptions/exception.handler';
import { ResultCode } from '../../../exceptions/exception-codes.enum';
import {
  userIDField,
  userNotFound,
} from '../../../exceptions/exception.constants';
import { BlogQueryDto } from '../../dto/blog.query.dto';
import { BloggerUpdateBlogCommand } from './application/use-cases/blogs/blogger.update-blog.use-case';
import { BloggerDeleteBlogCommand } from './application/use-cases/blogs/blogger.delete-blog.use-case';
import { PostInputDto } from '../../../posts/dto/post-input.dto';
import { PostsQueryRepository } from '../../../posts/posts.query.repository';
import { PostsService } from '../../../posts/posts.service';
import { Role } from '../../../enum/roles.enum';
import { BloggerUpdatePostCommand } from './application/use-cases/posts/blogger.update-post.use-case';
import { BloggerCreatePostCommand } from './application/use-cases/posts/blogger.create-post.use-case';
import { BloggerDeletePostCommand } from './application/use-cases/posts/blogger.delete-post.use-case';

@Controller('blogger/blogs')
export class BloggerBlogsController {
  constructor(
    private commandBus: CommandBus,
    private readonly postsService: PostsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @UseGuards(JwtBearerGuard)
  @Post()
  async createBlog(
    @Body() blogInputDto: BlogInputDto,
    @UserIdFromGuard() userId,
  ) {
    const blogId = await this.commandBus.execute(
      new BloggerCreateBlogCommand(blogInputDto, userId),
    );

    if (!blogId) {
      return exceptionHandler(ResultCode.NotFound, userNotFound, userIDField);
    }

    return this.blogsQueryRepository.findBlog(blogId);
  }

  @UseGuards(JwtBearerGuard)
  @Get()
  async findBlogs(@Query() query: BlogQueryDto, @UserIdFromGuard() userId) {
    const role = Role.Blogger;
    return this.blogsQueryRepository.findBlogs(query, role, userId);
  }

  @UseGuards(JwtBearerGuard)
  @Put(':id')
  @HttpCode(204)
  async updateBlog(
    @Body() blogInputDto: BlogInputDto,
    @Param('id') blogId,
    @UserIdFromGuard() userId,
  ) {
    const result = await this.commandBus.execute(
      new BloggerUpdateBlogCommand(blogInputDto, blogId, userId),
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
      new BloggerDeleteBlogCommand(blogId, userId),
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
      new BloggerCreatePostCommand(postInputDto, blogId, userId),
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
      new BloggerUpdatePostCommand(
        postInputDto,
        params.blogId,
        params.postId,
        userId,
      ),
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
      new BloggerDeletePostCommand(params.blogId, params.postId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }
}
