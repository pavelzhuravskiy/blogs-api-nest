import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from './schemas/post.entity';
import { Blog, BlogModelType } from '../blogs/schemas/blog.entity';
import mongoose from 'mongoose';
import { PostViewModel } from './schemas/post.view';

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

  async createPost(post: PostDocument): Promise<PostViewModel> {
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
}
