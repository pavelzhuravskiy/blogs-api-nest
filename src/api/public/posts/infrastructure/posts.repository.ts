import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../post.entity';
import { Blog, BlogModelType } from '../../blogs/blog.entity';
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

  async findPost(id: string): Promise<PostDocument | null> {
    if (!mongoose.isValidObjectId(id)) {
      return null;
    }

    const post = await this.PostModel.findOne({ _id: id });

    if (!post) {
      return null;
    }

    return post;
  }

  async deletePost(id: string): Promise<boolean> {
    const post = await this.PostModel.deleteOne({ _id: id });
    return post.deletedCount === 1;
  }

  async setPostsBanStatus(
    userId: string,
    banStatus: boolean,
  ): Promise<boolean> {
    const result = await this.PostModel.updateMany(
      { 'blogInfo.blogOwnerId': userId },
      {
        $set: {
          'blogInfo.blogOwnerIsBanned': banStatus,
        },
      },
    );
    return result.acknowledged === true;
  }
}
