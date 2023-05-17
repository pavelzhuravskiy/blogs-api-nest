import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExceptionResultType } from '../../../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../../../exceptions/enum/exception-codes.enum';
import {
  commentIDField,
  commentNotFound,
} from '../../../../../../exceptions/exception.constants';
import { CommentsRepository } from '../../../../infrastructure/comments.repository';

export class CommentDeleteCommand {
  constructor(public commentId: string, public userId: string) {}
}

@CommandHandler(CommentDeleteCommand)
export class CommentDeleteUseCase
  implements ICommandHandler<CommentDeleteCommand>
{
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute(
    command: CommentDeleteCommand,
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

    if (comment.commentatorInfo.userId !== command.userId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    await this.commentsRepository.deleteComment(command.commentId);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
