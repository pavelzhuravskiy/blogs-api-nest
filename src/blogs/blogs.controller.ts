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
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogCreateDto } from './dto/blog.create.dto';
import { BlogQuery } from './dto/blog.query';
import { BlogsQueryRepository } from './blogs.query.repository';
import { BlogUpdateDto } from './dto/blog.update.dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @Post()
  async createBlog(@Body() createBlogDto: BlogCreateDto) {
    return this.blogsService.createBlog(createBlogDto);
  }

  @Get()
  async findBlogs(@Query() query: BlogQuery) {
    return this.blogsQueryRepository.findBlogs(query);
  }

  @Get(':id')
  async findBlog(@Param('id') id: string) {
    return this.blogsQueryRepository.findBlog(id);
  }

  @Put(':id')
  @HttpCode(204)
  async updateBlog(
    @Param('id') id: string,
    @Body() updateBlogDto: BlogUpdateDto,
  ) {
    return this.blogsService.updateBlog(id, updateBlogDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(@Param('id') id: string) {
    return this.blogsService.deleteBlog(id);
  }
}
