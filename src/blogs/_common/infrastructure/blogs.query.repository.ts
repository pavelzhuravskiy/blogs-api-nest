import { Injectable } from '@nestjs/common';
import { Blog, BlogLeanType, BlogModelType } from '../blog.entity';
import { BlogQueryDto } from '../dto/blog-query.dto';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Paginator } from '../../../helpers/pagination/_paginator';
import { BlogViewDto } from '../dto/blog-view.dto';
import { pFind } from '../../../helpers/pagination/pagination-find';
import { pSort } from '../../../helpers/pagination/pagination-sort';
import { pFilterBlogs } from '../../../helpers/pagination/pagination-filter-blogs';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}
  async findBlogs(
    query: BlogQueryDto,
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

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: await this.blogsMapping(blogs),
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
      createdAt: blog.createdAt.toISOString(),
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
        createdAt: b.createdAt.toISOString(),
        isMembership: b.isMembership,
      };
    });
  }
}
