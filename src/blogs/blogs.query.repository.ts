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
    const term = query.searchNameTerm;
    const sortBy = query.sortBy || 'createdAt';
    const sortDirection = query.sortDirection;
    const pageNumber = Number(query.pageNumber) || 1;
    const pageSize = Number(query.pageSize) || 10;

    const filter: FilterQuery<BlogDocument> = {};

    if (term) {
      filter.name = { $regex: term, $options: 'i' };
    }

    const sortingObj: { [key: string]: SortOrder } = {
      [sortBy]: 'desc',
    };

    if (sortDirection === 'asc') {
      sortingObj[sortBy] = 'asc';
    }

    const blogs = await this.BlogModel.find(filter)
      .sort(sortingObj)
      .skip(pageNumber > 0 ? (pageNumber - 1) * pageSize : 0)
      .limit(pageSize > 0 ? pageSize : 0)
      .lean();

    const totalCount = await this.BlogModel.countDocuments(filter);
    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
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

    const blog = await this.BlogModel.findOne({ _id: id });

    if (!blog) {
      throw new NotFoundException();
    }

    return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt.toISOString(),
      isMembership: blog.isMembership,
    };
  }
}
