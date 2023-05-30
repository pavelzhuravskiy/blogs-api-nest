import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../infrastructure/users/users.repository';
import { SAUserBanInputDto } from '../../../../dto/users/sa.user-ban.input.dto';
import { ResultCode } from '../../../../../enums/result-code.enum';
import {
  userIDField,
  userIsAlreadyBanned,
  userIsAlreadyUnbanned,
  userNotFound,
} from '../../../../../exceptions/exception.constants';
import { ExceptionResultType } from '../../../../../exceptions/types/exception-result.type';
import { DevicesDeleteForUserBanCommand } from '../../../../_public/devices/application/use-cases/devices-delete-for-user-ban.use-case';
import { PostsRepository } from '../../../../infrastructure/posts/posts.repository';
import { BlogsRepository } from '../../../../infrastructure/blogs/blogs.repository';
import { CommentsRepository } from '../../../../infrastructure/comments/comments.repository';
import { LikesRepository } from '../../../../infrastructure/likes/likes.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../../../../entities/post.entity';
import { Comment, CommentModelType } from '../../../../entities/comment.entity';

export class SAUserBanCommand {
  constructor(
    public saUserBanInputDto: SAUserBanInputDto,
    public userId: string,
  ) {}
}

@CommandHandler(SAUserBanCommand)
export class UserBanUseCase implements ICommandHandler<SAUserBanCommand> {
  constructor(
    private commandBus: CommandBus,
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    private readonly usersRepository: UsersRepository,
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly likesRepository: LikesRepository,
  ) {}

  async execute(
    command: SAUserBanCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const user = await this.usersRepository.findUserById(command.userId);

    if (!user) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: userIDField,
        message: userNotFound,
      };
    }

    const banDBStatus = user.banInfo.isBanned;

    if (banDBStatus && command.saUserBanInputDto.isBanned) {
      return {
        data: false,
        code: ResultCode.BadRequest,
        field: userIDField,
        message: userIsAlreadyBanned,
      };
    }

    if (!banDBStatus && !command.saUserBanInputDto.isBanned) {
      return {
        data: false,
        code: ResultCode.BadRequest,
        field: userIDField,
        message: userIsAlreadyUnbanned,
      };
    }

    if (!banDBStatus) {
      user.saBanUser(command.saUserBanInputDto);

      await this.commandBus.execute(
        new DevicesDeleteForUserBanCommand(command.userId),
      );

      await this.blogsRepository.setBlogsBanStatus(command.userId, true);
      await this.postsRepository.setPostsBanStatus(command.userId, true);
      await this.commentsRepository.setCommentsBanStatus(command.userId, true);
      await this.likesRepository.setLikesBanStatus(
        command.userId,
        true,
        this.PostModel,
      );
      await this.likesRepository.setLikesBanStatus(
        command.userId,
        true,
        this.CommentModel,
      );
    } else {
      user.saUnbanUser();
      await this.blogsRepository.setBlogsBanStatus(command.userId, false);
      await this.postsRepository.setPostsBanStatus(command.userId, false);
      await this.commentsRepository.setCommentsBanStatus(command.userId, false);
      await this.likesRepository.setLikesBanStatus(
        command.userId,
        false,
        this.PostModel,
      );
      await this.likesRepository.setLikesBanStatus(
        command.userId,
        false,
        this.CommentModel,
      );
    }

    await this.usersRepository.save(user);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
