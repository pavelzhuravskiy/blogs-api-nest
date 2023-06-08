import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersMongooseRepository } from '../../../../infrastructure/_mongoose/users/users.mongoose.repository';
import { CommentInputDto } from '../../../../dto/comments/input/comment.input.dto';
import {
  Comment,
  CommentModelType,
} from '../../../../entities/_mongoose/comment.entity';
import { PostsMongooseRepository } from '../../../../infrastructure/_mongoose/posts/posts.repository';
import { CommentsRepository } from '../../../../infrastructure/_mongoose/comments/comments.repository';
import { ExceptionResultType } from '../../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../../enums/result-code.enum';
import {
  postIDField,
  postNotFound,
  userIDField,
  userIsBanned,
  userNotFound,
} from '../../../../../exceptions/exception.constants';

export class CommentCreateCommand {
  constructor(
    public commentInputDto: CommentInputDto,
    public postId: string,
    public userId: string,
  ) {}
}

@CommandHandler(CommentCreateCommand)
export class CommentCreateUseCase
  implements ICommandHandler<CommentCreateCommand>
{
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    private readonly commentsRepository: CommentsRepository,
    private readonly postsRepository: PostsMongooseRepository,
    private readonly usersRepository: UsersMongooseRepository,
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
      post.blogInfo.blogId,
    );

    if (isUserBannedByBlogger) {
      return {
        data: false,
        code: ResultCode.Forbidden,
        message: userIsBanned,
      };
    }

    const comment = this.CommentModel.createComment(
      this.CommentModel,
      command.commentInputDto,
      post,
      user,
    );

    await this.commentsRepository.save(comment);
    return {
      data: true,
      code: ResultCode.Success,
      response: comment.id,
    };
  }
}
