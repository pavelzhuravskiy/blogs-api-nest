import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from './schemas/blog.schema';
import { BlogCreateDto } from './dto/blog.create.dto';
import { BlogsRepository } from './blogs.repository';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async createBlog(createBlogDto: BlogCreateDto): Promise<Blog> {
    const createdBlog = this.BlogModel.createBlog(
      createBlogDto,
      this.BlogModel,
    );
    return this.blogsRepository.save(createdBlog);
  }
}
