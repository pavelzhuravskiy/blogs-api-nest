import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Post,
  PostDocument,
  PostModelType,
} from '../../../entities/_mongoose/post.entity';
import { Blog, BlogModelType } from '../../../entities/_mongoose/blog.entity';
import mongoose from 'mongoose';

@Injectable()
export class PostsMongooseRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}

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
}
