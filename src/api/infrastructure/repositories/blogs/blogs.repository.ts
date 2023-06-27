import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Blog } from '../../../entities/blogs/blog.entity';
import { BlogBan } from '../../../entities/blogs/blog-ban.entity';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  // ***** TypeORM query runner transaction SAVE *****
  async queryRunnerSave(
    entity: Blog | BlogBan,
    queryRunnerManager: EntityManager,
  ): Promise<Blog | BlogBan> {
    return queryRunnerManager.save(entity);
  }

  // ***** TypeORM data source manager SAVE *****
  async dataSourceSave(entity: Blog | BlogBan): Promise<Blog | BlogBan> {
    return this.dataSource.manager.save(entity);
  }

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
        .where(`b.id = :blogId`, { blogId: blogId })
        .leftJoinAndSelect('b.user', 'u')
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
        .where(`b.id = :blogId`, { blogId: blogId })
        .leftJoinAndSelect('b.blogBan', 'bb')
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
