import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExceptionResultType } from '../../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../../enums/result-code.enum';
import {
  commentIDField,
  commentNotFound,
} from '../../../../../exceptions/exception.constants';
import { CommentsRepository } from '../../../../infrastructure/repositories/comments/comments.repository';

export class CommentDeleteCommand {
  constructor(public commentId: string, public userId: number) {}
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

    /*if (comment.commentatorId !== command.userId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }*/

    await this.commentsRepository.deleteComment(comment.id);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
