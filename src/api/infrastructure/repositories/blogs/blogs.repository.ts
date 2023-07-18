import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Blog } from '../../../entities/blogs/blog.entity';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}
  // ***** Find blog operations *****
  async findBlog(blogId: string): Promise<Blog | null> {
    try {
      return await this.blogsRepository
        .createQueryBuilder('b')
        .where(`b.id = :blogId`, { blogId: blogId })
        .getOne();
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findBlogWithOwner(blogId: string): Promise<Blog | null> {
    try {
      return await this.blogsRepository
        .createQueryBuilder('b')
        .leftJoinAndSelect('b.user', 'u')
        .where(`b.id = :blogId`, { blogId: blogId })
        .getOne();
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findBlogForBlogBan(blogId: string): Promise<Blog | null> {
    try {
      return await this.blogsRepository
        .createQueryBuilder('b')
        .leftJoinAndSelect('b.blogBan', 'bb')
        .where(`b.id = :blogId`, { blogId: blogId })
        .getOne();
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  // ***** Delete operations *****
  async deleteBlog(blogId: number): Promise<boolean> {
    const result = await this.blogsRepository
      .createQueryBuilder('b')
      .delete()
      .from(Blog)
      .where('id = :blogId', { blogId: blogId })
      .execute();
    return result.affected === 1;
  }
}
