import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentInputDto } from '../../../../dto/comments/input/comment.input.dto';
import { ExceptionResultType } from '../../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../../enums/result-code.enum';
import {
  postIDField,
  postNotFound,
  userIDField,
  userIsBanned,
  userNotFound,
} from '../../../../../exceptions/exception.constants';
import { PostsRepository } from '../../../../infrastructure/repositories/posts/posts.repository';
import { UsersRepository } from '../../../../infrastructure/repositories/users/users.repository';
import { CommentsRepository } from '../../../../infrastructure/repositories/comments/comments.repository';
import { Comment } from '../../../../entities/comments/comment.entity';

export class CommentCreateCommand {
  constructor(
    public commentInputDto: CommentInputDto,
    public postId: string,
    public userId: number,
  ) {}
}

@CommandHandler(CommentCreateCommand)
export class CommentCreateUseCase
  implements ICommandHandler<CommentCreateCommand>
{
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(
    command: CommentCreateCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const post = await this.postsRepository.findPost(command.postId);

    if (!post) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: postIDField,
        message: postNotFound,
      };
    }

    const user = await this.usersRepository.findUserForBanByBlogger(
      command.userId,
    );

    if (!user) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: userIDField,
        message: userNotFound,
      };
    }

    if (user.userBanByBlogger.isBanned) {
      return {
        data: false,
        code: ResultCode.Forbidden,
        message: userIsBanned,
      };
    }

    const comment = new Comment();
    comment.post = post;
    comment.user = user;
    comment.content = command.commentInputDto.content;
    comment.createdAt = new Date();
    await this.commentsRepository.dataSourceSave(comment);

    return {
      data: true,
      code: ResultCode.Success,
      response: comment.id,
    };
  }
}
