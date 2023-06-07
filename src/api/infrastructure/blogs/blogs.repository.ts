import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogInputDto } from '../../dto/blogs/input/blog.input.dto';

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
}
