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
  UseInterceptors,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogCreateDto } from './dto/blog-create.dto';
import { BlogQuery } from './dto/blog.query';
import { BlogsQueryRepository } from './blogs.query.repository';
import { BlogUpdateDto } from './dto/blog-update.dto';
import { PostsService } from '../posts/posts.service';
import { PostCreateDto } from '../posts/dto/post-create.dto';
import { PostsQueryRepository } from '../posts/posts.query.repository';
import { ExceptionCode } from '../exceptions/exception-codes.enum';
import { exceptionHandler } from '../exceptions/exception.handler';
import { CommonQuery } from '../common/dto/common.query';
import { blogIDField, blogNotFound } from '../exceptions/exception.constants';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { BlogTransformInterceptor } from './interceptors/blog-transform.interceptor';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Post()
  @UseInterceptors(BlogTransformInterceptor)
  async createBlog(@Body() createBlogDto: BlogCreateDto) {
    return this.blogsService.createBlog(createBlogDto);
  }

  @Get()
  async findBlogs(@Query() query: BlogQuery) {
    return this.blogsQueryRepository.findBlogs(query);
  }

  @Get(':id')
  @UseInterceptors(BlogTransformInterceptor)
  async findBlog(@Param('id') id: string) {
    const result = await this.blogsQueryRepository.findBlog(id);

    if (!result) {
      return exceptionHandler(
        ExceptionCode.NotFound,
        blogNotFound,
        blogIDField,
      );
    }

    return result;
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async updateBlog(
    @Param('id') id: string,
    @Body() updateBlogDto: BlogUpdateDto,
  ) {
    const result = await this.blogsService.updateBlog(id, updateBlogDto);

    if (!result) {
      return exceptionHandler(
        ExceptionCode.NotFound,
        blogNotFound,
        blogIDField,
      );
    }

    return result;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(@Param('id') id: string) {
    const result = await this.blogsService.deleteBlog(id);

    if (!result) {
      return exceptionHandler(
        ExceptionCode.NotFound,
        blogNotFound,
        blogIDField,
      );
    }

    return result;
  }

  @UseGuards(BasicAuthGuard)
  @Post(':id/posts')
  async createPost(
    @Param('id') id: string,
    @Body() createPostDto: PostCreateDto,
  ) {
    const result = await this.postsService.createPost(createPostDto, id);

    if (!result) {
      return exceptionHandler(
        ExceptionCode.NotFound,
        blogNotFound,
        blogIDField,
      );
    }

    return result;
  }

  @Get(':id/posts')
  async findPosts(@Query() query: CommonQuery, @Param('id') id: string) {
    const result = await this.postsQueryRepository.findPosts(query, id);
    console.log(result);

    if (!result) {
      return exceptionHandler(
        ExceptionCode.NotFound,
        blogNotFound,
        blogIDField,
      );
    }

    return result;
  }
}
