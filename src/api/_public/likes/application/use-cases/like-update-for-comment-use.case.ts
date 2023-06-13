import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatusInputDto } from '../../../../dto/likes/input/like-status.input.dto';
import { CommentsRepository } from '../../../../infrastructure/comments/comments.repository';
import { UsersRepository } from '../../../../infrastructure/users/users.repository';
import { ResultCode } from '../../../../../enums/result-code.enum';
import {
  commentIDField,
  commentNotFound,
  userIDField,
  userNotFound,
} from '../../../../../exceptions/exception.constants';
import { ExceptionResultType } from '../../../../../exceptions/types/exception-result.type';

export class LikeUpdateForCommentCommand {
  constructor(
    public likeStatusInputDto: LikeStatusInputDto,
    public commentId: string,
    public userId: number,
  ) {}
}

@CommandHandler(LikeUpdateForCommentCommand)
export class LikeUpdateForCommentUseCase
  implements ICommandHandler<LikeUpdateForCommentCommand>
{
  constructor(
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

    if (userCommentLikeRecord) {
      await this.commentsRepository.updateLikeStatus(
        command.likeStatusInputDto.likeStatus,
        comment.id,
        user.id,
      );
    } else {
      await this.commentsRepository.createUserCommentLikeRecord(
        comment.id,
        user.id,
        command.likeStatusInputDto.likeStatus,
      );
    }

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
