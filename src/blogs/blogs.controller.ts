import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogCreateDto } from './dto/blog.create.dto';
import { BlogQuery } from './dto/blog.query';
import { BlogsQueryRepository } from './blogs.query.repository';

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
  async findAll(@Query() query: BlogQuery) {
    return this.blogsQueryRepository.findBlogs(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogsQueryRepository.findBlog(id);
  }
}
