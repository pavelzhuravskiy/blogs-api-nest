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
import { BlogInputDto } from '../_common/dto/blog-input.dto';
import { CommandBus } from '@nestjs/cqrs';
import { BloggerCreateBlogCommand } from './application/use-cases/blogger.create-blog.use-case';
import { BlogsQueryRepository } from '../_common/infrastructure/blogs.query.repository';
import { JwtBearerGuard } from '../../auth/guards/jwt-bearer.guard';
import { UserIdFromGuard } from '../../auth/decorators/user-id-from-guard.param.decorator';
import { exceptionHandler } from '../../exceptions/exception.handler';
import { ResultCode } from '../../exceptions/exception-codes.enum';
import {
  userIDField,
  userNotFound,
} from '../../exceptions/exception.constants';
import { BlogQueryDto } from '../_common/dto/blog-query.dto';
import { BloggerUpdateBlogCommand } from './application/use-cases/blogger.update-blog.use-case';
import { BloggerDeleteBlogCommand } from './application/use-cases/blogger.delete-blog.use-case';

@Controller('blogger/blogs')
export class BloggerBlogsController {
  constructor(
    private commandBus: CommandBus,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @UseGuards(JwtBearerGuard)
  @Post()
  async createBlog(
    @UserIdFromGuard() userId,
    @Body() blogInputDto: BlogInputDto,
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
    return this.blogsQueryRepository.findBlogs(query, userId);
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
  //
  // @UseGuards(BasicAuthGuard)
  // @Post(':id/posts')
  // async createPost(@Param('id') id, @Body() postInputDto: PostInputDto) {
  //   const postId = await this.postsService.createPost(postInputDto, id);
  //
  //   if (!postId) {
  //     return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIDField);
  //   }
  //
  //   return this.postsQueryRepository.findPost(postId);
  // }
  //
  // @Get(':id/posts')
  // async findPosts(
  //   @Query() query: CommonQueryDto,
  //   @Param('id') blogId,
  //   @UserIdFromHeaders() userId,
  // ) {
  //   const result = await this.postsQueryRepository.findPosts(
  //     query,
  //     userId,
  //     blogId,
  //   );
  //
  //   if (!result) {
  //     return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIDField);
  //   }
  //
  //   return result;
  // }
}
