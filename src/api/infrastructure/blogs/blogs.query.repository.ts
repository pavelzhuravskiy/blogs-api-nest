import { Injectable } from '@nestjs/common';
import { Blog, BlogLeanType, BlogModelType } from '../../entities/blog.entity';
import { BlogQueryDto } from '../../dto/blogs/query/blog.query.dto';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Paginator } from '../../../helpers/pagination/_paginator';
import { BlogViewDto } from '../../dto/blogs/view/blog.view.dto';
import { pFind } from '../../../helpers/pagination/pagination-find';
import { pSort } from '../../../helpers/pagination/pagination-sort';
import { pFilterBlogs } from '../../../helpers/pagination/pagination-filter-blogs';
import { Role } from '../../../enums/role.enum';
import { SuperAdminBlogViewDto } from '../../dto/blogs/view/superadmin/sa.blog.view.dto';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}
  async findBlogs(
    query: BlogQueryDto,
    role: string,
    userId?: string,
  ): Promise<Paginator<BlogViewDto[]>> {
    const blogs = await pFind(
      this.BlogModel,
      query.pageNumber,
      query.pageSize,
      pFilterBlogs(query.searchNameTerm, userId, role),
      pSort(query.sortBy, query.sortDirection),
    );

    const totalCount = await this.BlogModel.countDocuments(
      pFilterBlogs(query.searchNameTerm, userId, role),
    );

    let items = await this.blogsMapping(blogs);

    if (role === Role.SuperAdmin) {
      items = await this.blogsMappingForSA(blogs);
    }

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: items,
    });
  }

  async findBlog(id: string, role?: string): Promise<BlogViewDto | null> {
    if (!mongoose.isValidObjectId(id)) {
      return null;
    }

    const blog = await this.BlogModel.findOne({ _id: id });

    if (!blog || (blog.isBanned && role !== Role.SuperAdmin)) {
      return null;
    }

    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }

  private async blogsMapping(blogs: BlogLeanType[]): Promise<BlogViewDto[]> {
    return blogs.map((b) => {
      return {
        id: b._id.toString(),
        name: b.name,
        description: b.description,
        websiteUrl: b.websiteUrl,
        createdAt: b.createdAt,
        isMembership: b.isMembership,
      };
    });
  }

  private async blogsMappingForSA(
    blogs: BlogLeanType[],
  ): Promise<SuperAdminBlogViewDto[]> {
    return blogs.map((b) => {
      return {
        id: b._id.toString(),
        name: b.name,
        description: b.description,
        websiteUrl: b.websiteUrl,
        createdAt: b.createdAt,
        isMembership: b.isMembership,
        blogOwnerInfo: {
          userId: b.blogOwnerInfo.userId,
          userLogin: b.blogOwnerInfo.userLogin,
        },
      };
    });
  }

  /*private async bannedUsersMapping(users: BlogLeanType[]): Promise<any> {
    return users.map((b) => {

      return (b = b.bannedUsers);
    });
  }*/
}
