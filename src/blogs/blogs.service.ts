import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from './schemas/blog.entity';
import { BlogCreateDto } from './dto/blog.create.dto';
import { BlogsRepository } from './blogs.repository';
import { BlogUpdateDto } from './dto/blog.update.dto';
import { BlogViewModel } from './schemas/blog.view';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async createBlog(createBlogDto: BlogCreateDto): Promise<BlogViewModel> {
    const blog = this.BlogModel.createBlog(createBlogDto, this.BlogModel);
    return this.blogsRepository.createBlog(blog);
  }

  async updateBlog(id: string, updateBlogDto: BlogUpdateDto): Promise<Blog> {
    const blog = await this.blogsRepository.findBlog(id);

    if (!blog) {
      throw new InternalServerErrorException(
        `Something went wrong during blog find operation`,
      );
    }

    await blog.updateBlog(updateBlogDto);
    return this.blogsRepository.save(blog);
  }

  async deleteBlog(id: string): Promise<boolean> {
    const blog = await this.blogsRepository.findBlog(id);

    if (!blog) {
      throw new InternalServerErrorException(
        `Something went wrong during blog find operation`,
      );
    }

    return this.blogsRepository.deleteBlog(id);
  }

  async deleteBlogs(): Promise<boolean> {
    return this.blogsRepository.deleteBlogs();
  }
}
