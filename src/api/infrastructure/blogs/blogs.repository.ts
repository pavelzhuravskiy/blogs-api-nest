import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogInputDto } from '../../dto/blogs/input/blog.input.dto';
import { Blog } from '../../entities/blogs/blog.entity';
import { BlogOwner } from '../../entities/blogs/blog-owner.entity';

@Injectable()
export class BlogsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createBlog(
    blogInputDto: BlogInputDto,
    userId: number,
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
        `insert into public.blog_owners ("blogId", "ownerId")
         values ($1, $2);`,
        [blogId, userId],
      );

      return blogId;
    });
  }

  async findBlog(blogId: number): Promise<(Blog & BlogOwner) | null> {
    if (isNaN(blogId)) {
      return null;
    }

    const blogs = await this.dataSource.query(
      `select b.id, bo."ownerId"
       from blogs b
                left join blog_owners bo on b.id = bo."blogId"
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
}
