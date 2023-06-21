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

    const user = await this.usersRepository.findUserById(command.userId);

    if (!user) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: userIDField,
        message: userNotFound,
      };
    }

    const isUserBannedByBlogger = await this.usersRepository.findUserBanForBlog(
      user.id,
      post.blogId,
    );

    if (isUserBannedByBlogger) {
      return {
        data: false,
        code: ResultCode.Forbidden,
        message: userIsBanned,
      };
    }

    const commentId = await this.commentsRepository.createComment(
      command.commentInputDto,
      user.id,
      user.login,
      post.id,
    );

    return {
      data: true,
      code: ResultCode.Success,
      response: commentId,
    };
  }
}
