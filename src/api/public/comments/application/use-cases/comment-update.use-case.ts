import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExceptionResultType } from '../../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../../enums/result-code.enum';
import {
  commentIDField,
  commentNotFound,
} from '../../../../../exceptions/exception.constants';
import { CommentInputDto } from '../../dto/comment.input.dto';
import { CommentsRepository } from '../../infrastructure/comments.repository';

export class CommentUpdateCommand {
  constructor(
    public commentInputDto: CommentInputDto,
    public commentId: string,
    public userId: string,
  ) {}
}

@CommandHandler(CommentUpdateCommand)
export class CommentUpdateUseCase
  implements ICommandHandler<CommentUpdateCommand>
{
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute(
    command: CommentUpdateCommand,
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

    await comment.updateComment(command.commentInputDto);
    await comment.save();

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
