import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from './schemas/comment.entity';
import { CommentsRepository } from './comments.repository';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    private readonly commentsRepository: CommentsRepository,
  ) {}
}
