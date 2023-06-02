import { Injectable } from '@nestjs/common';
import {
  Blog,
  BlogDocument,
  BlogModelType,
} from '../../entities/_mongoose/blog.entity';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}
  async save(blog: BlogDocument) {
    return blog.save();
  }

  async findBlog(id?: string): Promise<BlogDocument | null> {
    if (!mongoose.isValidObjectId(id)) {
      return null;
    }

    const blog = await this.BlogModel.findOne({ _id: id });

    if (!blog) {
      return null;
    }

    return blog;
  }

  async deleteBlog(id: string): Promise<boolean> {
    const blog = await this.BlogModel.deleteOne({ _id: id });
    return blog.deletedCount === 1;
  }

  async setBlogsOwnerBanStatus(
    userId: string,
    banStatus: boolean,
  ): Promise<boolean> {
    const result = await this.BlogModel.updateMany(
      { 'blogOwnerInfo.userId': userId },
      {
        $set: {
          'blogOwnerInfo.isBanned': banStatus,
        },
      },
    );
    return result.acknowledged === true;
  }
}
