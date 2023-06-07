import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogViewDto } from '../../dto/blogs/view/blog.view.dto';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findBlog(id: number): Promise<BlogViewDto> {
    const blogs = await this.dataSource.query(
      `select id, name, description, "websiteUrl", "createdAt", "isMembership"
       from public.blogs
       where id = $1`,
      [id],
    );

    const mappedBlogs = await this.blogsMapping(blogs);
    return mappedBlogs[0];
  }

  private async blogsMapping(array: any): Promise<BlogViewDto> {
    return array.map((b) => {
      return {
        id: b.id.toString(),
        name: b.name,
        description: b.description,
        websiteUrl: b.websiteUrl,
        createdAt: b.createdAt.toISOString(),
        isMembership: b.isMembership,
      };
    });
  }
}
