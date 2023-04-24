import { Injectable, NotFoundException } from '@nestjs/common';
import { Blog, BlogDocument, BlogModelType } from './schemas/blog.entity';
import { BlogQuery } from './dto/blog.query';
import mongoose, { FilterQuery, SortOrder } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Paginator } from '../common/schemas/paginator';
import { BlogViewModel } from './schemas/blog.view';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}
  async findBlogs(query: BlogQuery): Promise<Paginator<BlogViewModel[]>> {
    const filter: FilterQuery<BlogDocument> = {};

    if (query.searchNameTerm) {
      filter.name = { $regex: query.searchNameTerm, $options: 'i' };
    }

    const sortingObj: { [key: string]: SortOrder } = {
      [query.sortBy || 'createdAt']: 'desc',
    };

    if (query.sortDirection === 'asc') {
      sortingObj[query.sortBy || 'createdAt'] = 'asc';
    }

    const blogs = await this.BlogModel.find(filter)
      .sort(sortingObj)
      .skip(
        +query.pageNumber > 0 ? (+query.pageNumber - 1) * +query.pageSize : 0,
      )
      .limit(+query.pageSize > 0 ? +query.pageSize : 0)
      .lean();

    const totalCount = await this.BlogModel.countDocuments(filter);
    const pagesCount = Math.ceil(totalCount / +query.pageSize);

    return {
      pagesCount: pagesCount || 1,
      page: +query.pageNumber || 1,
      pageSize: +query.pageSize || 10,
      totalCount,
      items: blogs.map((blog) => {
        return {
          id: blog._id.toString(),
          name: blog.name,
          description: blog.description,
          websiteUrl: blog.websiteUrl,
          createdAt: blog.createdAt.toISOString(),
          isMembership: blog.isMembership,
        };
      }),
    };
  }

  async findBlog(id: string): Promise<BlogViewModel> {
    if (!mongoose.isValidObjectId(id)) {
      throw new NotFoundException();
    }

    const foundBlog = await this.BlogModel.findOne({ _id: id });

    if (!foundBlog) {
      throw new NotFoundException();
    }

    return {
      id: foundBlog._id.toString(),
      name: foundBlog.name,
      description: foundBlog.description,
      websiteUrl: foundBlog.websiteUrl,
      createdAt: foundBlog.createdAt.toISOString(),
      isMembership: foundBlog.isMembership,
    };
  }
}
