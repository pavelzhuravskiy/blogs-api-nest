import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  PostMongooseEntity,
  PostDocument,
  PostModelType,
} from '../../../entities/_mongoose/post.entity';
import {
  BlogMongooseEntity,
  BlogModelType,
} from '../../../entities/_mongoose/blog.entity';
import mongoose from 'mongoose';

@Injectable()
export class PostsMongooseRepository {
  constructor(
    @InjectModel(PostMongooseEntity.name)
    private PostModel: PostModelType,
    @InjectModel(BlogMongooseEntity.name)
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
