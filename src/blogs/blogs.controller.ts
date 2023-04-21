import { Body, Controller, Post } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  async createBlog(@Body() createBlogDto: CreateBlogDto) {
    await this.blogsService.createBlog(createBlogDto);
  }
}
