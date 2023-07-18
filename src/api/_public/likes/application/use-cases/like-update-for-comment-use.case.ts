import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatusInputDto } from '../../../../dto/likes/input/like-status.input.dto';
import { CommentsRepository } from '../../../../infrastructure/repositories/comments/comments.repository';
import { UsersRepository } from '../../../../infrastructure/repositories/users/users.repository';
import { ResultCode } from '../../../../../enums/result-code.enum';
import {
  commentIDField,
  commentNotFound,
  userIDField,
  userNotFound,
} from '../../../../../exceptions/exception.constants';
import { ExceptionResultType } from '../../../../../exceptions/types/exception-result.type';
import { CommentLike } from '../../../../entities/comments/comment-like.entity';
import { DataSourceRepository } from '../../../../infrastructure/repositories/common/data-source.repository';

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
    private readonly dataSourceRepository: DataSourceRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(
    command: LikeUpdateForCommentCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const comment = await this.commentsRepository.findComment(
      command.commentId,
    );

    if (!comment) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: commentIDField,
        message: commentNotFound,
      };
    }

    const user = await this.usersRepository.findUserById(command.userId);

    if (!user) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: userIDField,
        message: userNotFound,
      };
    }

    const userCommentLikeRecord =
      await this.commentsRepository.findUserCommentLikeRecord(
        comment.id,
        user.id,
      );

    let likeRecord;

    if (userCommentLikeRecord) {
      likeRecord = userCommentLikeRecord;
    } else {
      likeRecord = new CommentLike();
    }

    likeRecord.comment = comment;
    likeRecord.user = user;
    likeRecord.likeStatus = command.likeStatusInputDto.likeStatus;

    await this.dataSourceRepository.save(likeRecord);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
