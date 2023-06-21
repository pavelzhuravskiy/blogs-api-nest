import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogInputDto } from '../../../dto/blogs/input/blog.input.dto';
import { Blog } from '../../../entities/blogs/blog.entity';
import { BlogOwner } from '../../../entities/blogs/blog-owner.entity';
import { idIsValid } from '../../../../helpers/id-is-valid';

@Injectable()
export class BlogsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createBlog(
    blogInputDto: BlogInputDto,
    userId: number,
    userLogin: string,
  ): Promise<number> {
    return this.dataSource.transaction(async () => {
      const blog = await this.dataSource.query(
        `insert into public.blogs (name, description, "websiteUrl")
         values ($1, $2, $3)
         returning id;`,
        [blogInputDto.name, blogInputDto.description, blogInputDto.websiteUrl],
      );

      const blogId = blog[0].id;

      await this.dataSource.query(
        `insert into public.blog_bans ("blogId")
         values ($1);`,
        [blogId],
      );

      await this.dataSource.query(
        `insert into public.blog_owners ("blogId", "ownerId", "ownerLogin")
         values ($1, $2, $3);`,
        [blogId, userId, userLogin],
      );

      return blogId;
    });
  }

  async findBlog(blogId: string): Promise<(Blog & BlogOwner) | null> {
    if (!idIsValid(blogId)) {
      return null;
    }

    const blogs = await this.dataSource.query(
      `select b.id, bo."ownerId", b."isBanned"
       from public.blogs b
                left join public.blog_owners bo on b.id = bo."blogId"
       where b.id = $1;`,
      [blogId],
    );

    if (blogs.length === 0) {
      return null;
    }

    return blogs[0];
  }

  async updateBlog(
    blogInputDto: BlogInputDto,
    blogId: number,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
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
    return result[1] === 1;
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
    return this.dataSource.transaction(async () => {
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
    });
  }

  async unbanBlog(blogId: number): Promise<boolean> {
    return this.dataSource.transaction(async () => {
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
    });
  }
}
