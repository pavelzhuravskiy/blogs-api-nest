import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikesDataType } from '../../../../dto/likes/schemas/likes-data.type';
import { LikesService } from '../likes.service';
import { LikeStatusInputDto } from '../../../../dto/likes/input/like-status.input.dto';
import { CommentsRepository } from '../../../../infrastructure/_mongoose/comments/comments.repository';
import {
  Comment,
  CommentModelType,
} from '../../../../entities/_mongoose/comment.entity';

export class LikeUpdateForCommentCommand {
  constructor(
    public likeStatusInputDto: LikeStatusInputDto,
    public commentId: string,
    public userId: string,
  ) {}
}

@CommandHandler(LikeUpdateForCommentCommand)
export class LikeUpdateForCommentUseCase
  implements ICommandHandler<LikeUpdateForCommentCommand>
{
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    private readonly commentsRepository: CommentsRepository,
    private readonly likesService: LikesService,
  ) {}

  async execute(command: LikeUpdateForCommentCommand): Promise<boolean | null> {
    const comment = await this.commentsRepository.findComment(
      command.commentId,
    );

    if (!comment) {
      return null;
    }

    const data: LikesDataType = {
      commentOrPostId: command.commentId,
      userId: command.userId,
      userIsBanned: comment.commentatorInfo.isBanned,
      likeStatus: command.likeStatusInputDto.likeStatus,
      likesCount: comment.likesInfo.likesCount,
      dislikesCount: comment.likesInfo.dislikesCount,
      model: this.CommentModel,
    };

    return this.likesService.updateLikesData(data);
  }
}
