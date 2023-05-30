import { Injectable } from '@nestjs/common';
import { Blog, BlogLeanType, BlogModelType } from '../../entities/blog.entity';
import { BlogQueryDto } from '../../dto/blogs/blog.query.dto';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Paginator } from '../../../helpers/pagination/_paginator';
import { BlogViewDto } from '../../dto/blogs/blog.view.dto';
import { pFind } from '../../../helpers/pagination/pagination-find';
import { pSort } from '../../../helpers/pagination/pagination-sort';
import { pFilterBlogs } from '../../../helpers/pagination/pagination-filter-blogs';
import { Role } from '../../../enums/role.enum';
import { SuperAdminBlogViewDto } from '../../dto/blogs/sa.blog-view.dto';
import { BlogBannedUsersQueryDto } from '../../dto/blogs/blog-banned-users.query.dto';

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
      pFilterBlogs(query.searchNameTerm, userId),
      pSort(query.sortBy, query.sortDirection),
    );

    const totalCount = await this.BlogModel.countDocuments(
      pFilterBlogs(query.searchNameTerm, userId),
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

  async findBlog(id: string): Promise<BlogViewDto | null> {
    if (!mongoose.isValidObjectId(id)) {
      return null;
    }

    const blog = await this.BlogModel.findOne({ _id: id });

    if (!blog) {
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

  async findBannedUsers(
    query: BlogBannedUsersQueryDto,
    blogId: string,
  ): Promise</*Paginator<BlogViewDto[]>*/ any> {
    if (!mongoose.isValidObjectId(blogId)) {
      return null;
    }

    const blog = await this.BlogModel.findOne({ _id: blogId });

    if (!blog) {
      return null;
    }

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: blog.bannedUsers.length,
      items: blog.bannedUsers,
    });
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
