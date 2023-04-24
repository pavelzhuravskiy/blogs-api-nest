import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from './schemas/post.entity';
import {
  Blog,
  BlogDocument,
  BlogModelType,
} from '../blogs/schemas/blog.entity';
import mongoose from 'mongoose';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}
  async save(post: PostDocument) {
    return post.save();
  }

  async createPost(post: PostDocument) {
    await post.save();
    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt.toISOString(),
      extendedLikesInfo: {
        likesCount: post.extendedLikesInfo.likesCount,
        dislikesCount: post.extendedLikesInfo.dislikesCount,
        myStatus: 'None',
        newestLikes: [],
      },
    };
  }

  async findBlog(id: string): Promise<BlogDocument | null> {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException(`Blog with provided ID not found`);
    }

    const blog = await this.BlogModel.findOne({ _id: id });

    if (!blog) {
      throw new BadRequestException(`Blog with provided ID not found`);
    }

    return blog;
  }
  //
  // async findBlog(id: string): Promise<BlogDocument | null> {
  //   if (!mongoose.isValidObjectId(id)) {
  //     throw new NotFoundException();
  //   }
  //
  //   const blog = await this.BlogModel.findOne({ _id: id });
  //
  //   if (!blog) {
  //     throw new NotFoundException();
  //   }
  //
  //   return blog;
  // }
  //
  // async deleteBlog(id: string): Promise<boolean> {
  //   const blog = await this.BlogModel.deleteOne({ _id: id });
  //   return blog.deletedCount === 1;
  // }
}
