import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from './schemas/comment.entity';
import { CommentsRepository } from './comments.repository';
import { ExceptionResultType } from '../exceptions/types/exception-result.type';
import { ResultCode } from '../exceptions/exception-codes.enum';
import {
  commentIDField,
  commentNotFound,
} from '../exceptions/exception.constants';
import { CommentInputDto } from './dto/comment-input.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async updateComment(
    currentUserId: string,
    commentId: string,
    commentInputDto: CommentInputDto,
  ): Promise<ExceptionResultType<boolean>> {
    const comment = await this.commentsRepository.findComment(commentId);

    if (!comment) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: commentIDField,
        message: commentNotFound,
      };
    }

    if (comment.commentatorInfo.userId !== currentUserId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    await comment.updateComment(commentInputDto);
    await comment.save();

    return {
      data: true,
      code: ResultCode.Success,
    };
  }

  async deleteComment(
    currentUserId: string,
    commentId: string,
  ): Promise<ExceptionResultType<boolean>> {
    const comment = await this.commentsRepository.findComment(commentId);

    if (!comment) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: commentIDField,
        message: commentNotFound,
      };
    }

    if (comment.commentatorInfo.userId !== currentUserId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    await this.commentsRepository.deleteComment(commentId);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
