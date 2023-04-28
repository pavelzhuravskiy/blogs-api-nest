import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from './schemas/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
  ) {}
  async save(comment: CommentDocument) {
    return comment.save();
  }
  async deleteComments(): Promise<boolean> {
    await this.CommentModel.deleteMany({});
    return (await this.CommentModel.countDocuments()) === 0;
  }
}
