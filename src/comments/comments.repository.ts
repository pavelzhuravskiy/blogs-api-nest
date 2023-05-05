import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from './schemas/comment.entity';
import { CommentViewModel } from './schemas/comment.view';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
  ) {}
  async save(comment: CommentDocument) {
    return comment.save();
  }

  async createComment(comment: CommentDocument): Promise<CommentViewModel> {
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
}
