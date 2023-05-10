import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from './schemas/blog.entity';
import { BlogInputDto } from './dto/blog-input.dto';
import { BlogsRepository } from './blogs.repository';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async createBlog(blogInputDto: BlogInputDto): Promise<string | null> {
    const blog = this.BlogModel.createBlog(blogInputDto, this.BlogModel);
    await this.blogsRepository.save(blog);
    return blog.id;
  }

  async updateBlog(
    id: string,
    blogInputDto: BlogInputDto,
  ): Promise<Blog | null> {
    const blog = await this.blogsRepository.findBlog(id);

    if (!blog) {
      return null;
    }

    await blog.updateBlog(blogInputDto);
    return this.blogsRepository.save(blog);
  }

  async deleteBlog(id: string): Promise<boolean | null> {
    const blog = await this.blogsRepository.findBlog(id);

    if (!blog) {
      return null;
    }

    return this.blogsRepository.deleteBlog(id);
  }
}
