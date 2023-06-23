import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { BlogInputDto } from '../../../dto/blogs/input/blog.input.dto';
import { Blog } from '../../../entities/blogs/blog.entity';
import { BlogOwner } from '../../../entities/blogs/blog-owner.entity';
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
    entity: Blog | BlogBan | BlogOwner,
    queryRunnerManager: EntityManager,
  ): Promise<Blog | BlogBan | BlogOwner> {
    return queryRunnerManager.save(entity);
  }

  // ***** TypeORM data source manager SAVE *****
  async dataSourceSave(entity: BlogBan): Promise<BlogBan> {
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

  async updateBlog(
    blogInputDto: BlogInputDto,
    blogId: number,
  ): Promise<boolean> {
    /*const result = await this.dataSource.query(
      `update public.blogs
       set "name"        = $1,
           "description" = $2,
           "websiteUrl"  = $3
       where "id" = $4`,
      [
        blogInputDto.name,
        blogInputDto.description,
        blogInputDto.websiteUrl,
        blogId,
      ],
    );
    return result[1] === 1;*/
    return true;
  }

  async deleteBlog(blogId: number): Promise<boolean> {
    const result = await this.dataSource.query(
      `delete
       from public.blogs
       where id = $1;`,
      [blogId],
    );
    return result[1] === 1;
  }

  async banBlog(blogId: number): Promise<boolean> {
    return true;
    /*return this.dataSource.transaction(async () => {
      await this.dataSource.query(
        `update public.blogs
         set "isBanned" = true
         where id = $1`,
        [blogId],
      );

      const result = await this.dataSource.query(
        `update public.blog_bans
         set "banDate" = now()
         where "blogId" = $1`,
        [blogId],
      );
      return result[1] === 1;
    });*/
  }

  async unbanBlog(blogId: number): Promise<boolean> {
    return true;
    /*return this.dataSource.transaction(async () => {
      await this.dataSource.query(
        `update public.blogs
         set "isBanned" = false
         where id = $1`,
        [blogId],
      );

      const result = await this.dataSource.query(
        `update public.blog_bans
         set "banDate" = null
         where "blogId" = $1`,
        [blogId],
      );
      return result[1] === 1;
    });*/
  }
}
