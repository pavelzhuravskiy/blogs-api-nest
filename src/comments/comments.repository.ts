import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from './schemas/comment.entity';
import mongoose from 'mongoose';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
  ) {}
  async save(comment: CommentDocument) {
    return comment.save();
  }

  async findComment(id: string): Promise<CommentDocument | null> {
    if (!mongoose.isValidObjectId(id)) {
      return null;
    }

    const comment = await this.CommentModel.findOne({ _id: id });

    if (!comment) {
      return null;
    }

    return comment;
  }

  async deleteComment(id: string): Promise<boolean> {
    const comment = await this.CommentModel.deleteOne({ _id: id });
    return comment.deletedCount === 1;
  }
}
