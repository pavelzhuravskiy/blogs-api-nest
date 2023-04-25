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
  async createComment(comment: CommentDocument) {
    await comment.save();
    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt.toISOString(),
      likesInfo: {
        likesCount: comment.extendedLikesInfo.likesCount,
        dislikesCount: comment.extendedLikesInfo.dislikesCount,
        myStatus: 'None',
      },
    };
  }
  async deleteComments(): Promise<boolean> {
    await this.CommentModel.deleteMany({});
    return (await this.CommentModel.countDocuments()) === 0;
  }
}
