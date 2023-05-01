import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from './schemas/blog.entity';
import { BlogCreateDto } from './dto/blog-create.dto';
import { BlogsRepository } from './blogs.repository';
import { BlogUpdateDto } from './dto/blog-update.dto';
import { BlogViewModel } from './schemas/blog.view';
import { BlogsQueryRepository } from './blogs.query.repository';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    private readonly blogsRepository: BlogsRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async createBlog(
    createBlogDto: BlogCreateDto,
  ): Promise<BlogViewModel | null> {
    const blog = this.BlogModel.createBlog(createBlogDto, this.BlogModel);
    await this.blogsRepository.save(blog);
    return this.blogsQueryRepository.findBlog(blog.id);
  }

  async updateBlog(
    id: string,
    updateBlogDto: BlogUpdateDto,
  ): Promise<Blog | null> {
    const blog = await this.blogsRepository.findBlog(id);

    if (!blog) {
      return null;
    }

    await blog.updateBlog(updateBlogDto);
    return await this.blogsRepository.save(blog);
  }

  async deleteBlog(id: string): Promise<boolean | null> {
    const blog = await this.blogsRepository.findBlog(id);

    if (!blog) {
      return null;
    }

    return this.blogsRepository.deleteBlog(id);
  }

  async deleteBlogs(): Promise<boolean> {
    return this.blogsRepository.deleteBlogs();
  }
}
