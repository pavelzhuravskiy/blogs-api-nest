import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogViewDto } from '../../dto/blogs/view/blog.view.dto';
import { Paginator } from '../../../helpers/pagination/_paginator';
import { BlogQueryDto } from '../../dto/blogs/query/blog.query.dto';
import { filterBlogs } from '../../../helpers/filters/filter-blogs';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findBlogsOfCurrentBlogger(
    query: BlogQueryDto,
    userId: number,
  ): Promise<Paginator<BlogViewDto[]>> {
    const filter = filterBlogs(query.searchNameTerm);

    const blogs = await this.dataSource.query(
      `select b.id,
              b.name,
              b.description,
              b."websiteUrl",
              b."createdAt",
              b."isMembership",
              bo."ownerId"
       from blogs b
                left join blog_owners bo on b.id = bo."blogId"
       where (bo."ownerId" = $1)
         and (b.name ilike $2)
       order by "${query.sortBy}" ${query.sortDirection}
       limit ${query.pageSize} offset (${query.pageNumber} - 1) * ${query.pageSize}`,
      [userId, filter],
    );

    const totalCount = await this.dataSource.query(
      `select count(*)
       from blogs b
                left join blog_owners bo on b.id = bo."blogId"
       where (bo."ownerId" = $1)
         and (b.name ilike $2);`,
      [userId, filter],
    );

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: Number(totalCount[0].count),
      items: await this.blogsMapping(blogs),
    });
  }

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

  private async blogsMapping(array: any): Promise<BlogViewDto[]> {
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
