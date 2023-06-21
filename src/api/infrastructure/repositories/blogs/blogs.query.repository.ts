import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogViewDto } from '../../../dto/blogs/view/blog.view.dto';
import { Paginator } from '../../../../helpers/paginator';
import { BlogQueryDto } from '../../../dto/blogs/query/blog.query.dto';
import { filterBlogs } from '../../../../helpers/filters/filter-blogs';
import { Role } from '../../../../enums/role.enum';
import { SuperAdminBlogViewDto } from '../../../dto/blogs/view/superadmin/sa.blog.view.dto';
import { Blog } from '../../../entities/blogs/blog.entity';
import { BlogOwner } from '../../../entities/blogs/blog-owner.entity';
import { BlogBan } from '../../../entities/blogs/blog-ban.entity';
import { idIsValid } from '../../../../helpers/id-is-valid';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findBlogs(
    query: BlogQueryDto,
    role: string,
  ): Promise<Paginator<BlogViewDto[]>> {
    const filter = filterBlogs(query.searchNameTerm, role);

    const blogs = await this.dataSource.query(
      `select b.id,
              b.name,
              b.description,
              b."websiteUrl",
              b."createdAt",
              b."isMembership",
              b."isBanned",
              bo."ownerId",
              bo."ownerLogin",
              bb."banDate"
       from public.blogs b
                left join public.blog_owners bo on b.id = bo."blogId"
                left join public.blog_bans bb on b.id = bb."blogId"
       where (b.name ilike $1)
         and ("isBanned" = false or "isBanned" = $2)
       order by "${query.sortBy}" ${query.sortDirection}
       limit ${query.pageSize} offset (${query.pageNumber} - 1) * ${query.pageSize}`,
      [filter.nameFilter, filter.banFilter],
    );

    const totalCount = await this.dataSource.query(
      `select count(*)
       from public.blogs b
                left join public.blog_owners bo on b.id = bo."blogId"
       where (b.name ilike $1)
         and ("isBanned" = false or "isBanned" = $2);`,
      [filter.nameFilter, filter.banFilter],
    );

    let items = await this.blogsMapping(blogs);

    if (role === Role.SuperAdmin) {
      items = await this.blogsMappingForSA(blogs);
    }

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: Number(totalCount[0].count),
      items: items,
    });
  }

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
       from public.blogs b
                left join public.blog_owners bo on b.id = bo."blogId"
       where (bo."ownerId" = $1)
         and (b.name ilike $2)
       order by "${query.sortBy}" ${query.sortDirection}
       limit ${query.pageSize} offset (${query.pageNumber} - 1) * ${query.pageSize}`,
      [userId, filter.nameFilter],
    );

    const totalCount = await this.dataSource.query(
      `select count(*)
       from public.blogs b
                left join public.blog_owners bo on b.id = bo."blogId"
       where (bo."ownerId" = $1)
         and (b.name ilike $2);`,
      [userId, filter.nameFilter],
    );

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: Number(totalCount[0].count),
      items: await this.blogsMapping(blogs),
    });
  }

  async findBlog(blogId: string, role?: string): Promise<BlogViewDto> {
    if (!idIsValid(blogId)) {
      return null;
    }

    const blogs = await this.dataSource.query(
      `select id,
              name,
              description,
              "websiteUrl",
              "createdAt",
              "isMembership",
              "isBanned"
       from public.blogs
       where id = $1`,
      [blogId],
    );

    if (blogs.length === 0 || blogs[0].isBanned) {
      return null;
    }

    let mappedBlogs = await this.blogsMapping(blogs);

    if (role === Role.SuperAdmin) {
      mappedBlogs = await this.blogsMappingForSA(blogs);
    }

    return mappedBlogs[0];
  }

  private async blogsMapping(blogs: any): Promise<BlogViewDto[]> {
    return blogs.map((b) => {
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

  private async blogsMappingForSA(
    blogs: Array<Blog & BlogOwner & BlogBan>,
  ): Promise<SuperAdminBlogViewDto[]> {
    return blogs.map((b) => {
      return {
        id: b.id.toString(),
        name: b.name,
        description: b.description,
        websiteUrl: b.websiteUrl,
        createdAt: b.createdAt,
        isMembership: b.isMembership,
        blogOwnerInfo: {
          userId: b.ownerId.toString(),
          userLogin: b.ownerLogin,
        },
        banInfo: {
          isBanned: b.isBanned,
          banDate: b.banDate,
        },
      };
    });
  }
}
