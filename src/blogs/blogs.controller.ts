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
import { BlogsService } from './blogs.service';
import { BlogInputDto } from './dto/blog-input.dto';
import { BlogQueryDto } from './dto/blog-query.dto';
import { BlogsQueryRepository } from './blogs.query.repository';
import { PostsService } from '../posts/posts.service';
import { PostInputDto } from '../posts/dto/post-input.dto';
import { PostsQueryRepository } from '../posts/posts.query.repository';
import { ResultCode } from '../exceptions/exception-codes.enum';
import { exceptionHandler } from '../exceptions/exception.handler';
import { CommonQueryDto } from '../common/dto/common-query.dto';
import { blogIDField, blogNotFound } from '../exceptions/exception.constants';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';

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
  async createBlog(@Body() blogInputDto: BlogInputDto) {
    return this.blogsService.createBlog(blogInputDto);
  }

  @Get()
  async findBlogs(@Query() query: BlogQueryDto) {
    console.log(query);
    return this.blogsQueryRepository.findBlogs(query);
  }

  @Get(':id')
  async findBlog(@Param('id') id: string) {
    const result = await this.blogsQueryRepository.findBlog(id);

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIDField);
    }

    return result;
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async updateBlog(
    @Param('id') id: string,
    @Body() blogInputDto: BlogInputDto,
  ) {
    const result = await this.blogsService.updateBlog(id, blogInputDto);

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIDField);
    }

    return result;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(@Param('id') id: string) {
    const result = await this.blogsService.deleteBlog(id);

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIDField);
    }

    return result;
  }

  @UseGuards(BasicAuthGuard)
  @Post(':id/posts')
  async createPost(
    @Param('id') id: string,
    @Body() postInputDto: PostInputDto,
  ) {
    const result = await this.postsService.createPost(postInputDto, id);

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIDField);
    }

    return result;
  }

  @Get(':id/posts')
  async findPosts(@Query() query: CommonQueryDto, @Param('id') id: string) {
    const result = await this.postsQueryRepository.findPosts(query, id);
    console.log(result);

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIDField);
    }

    return result;
  }
}
