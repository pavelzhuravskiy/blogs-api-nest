import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SAUserBanInputDto } from '../../../../dto/users/input/superadmin/sa.user-ban.input.dto';
import { ResultCode } from '../../../../../enums/result-code.enum';
import {
  userIDField,
  userIsAlreadyBanned,
  userIsAlreadyUnbanned,
  userNotFound,
} from '../../../../../exceptions/exception.constants';
import { ExceptionResultType } from '../../../../../exceptions/types/exception-result.type';
import { PostsRepository } from '../../../../infrastructure/posts/posts.repository';
import { BlogsRepository } from '../../../../infrastructure/blogs/blogs.repository';
import { CommentsRepository } from '../../../../infrastructure/comments/comments.repository';
import { LikesRepository } from '../../../../infrastructure/likes/likes.repository';
import { UsersRepository } from '../../../../infrastructure/users/users.repository';
import { DevicesRepository } from '../../../../infrastructure/devices/devices.repository';

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
    private readonly usersRepository: UsersRepository,
    private readonly devicesRepository: DevicesRepository,
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly likesRepository: LikesRepository,
  ) {}

  async execute(
    command: SAUserBanCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const user = await this.usersRepository.findUserById(+command.userId);

    if (!user) {
      return {
        data: false,
        code: ResultCode.BadRequest,
        field: userIDField,
        message: userNotFound,
      };
    }

    const banDBStatus = user.isBanned;

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
      await this.usersRepository.banUser(
        user.id,
        command.saUserBanInputDto.banReason,
      );

      await this.devicesRepository.deleteBannedUserDevices(user.id);

      /*await this.blogsRepository.setBlogsOwnerBanStatus(command.userId, true);*/
      /*await this.postsRepository.setPostsOwnerBanStatus(command.userId, true);*/
      /*await this.commentsRepository.setCommentsOwnerBanStatus(
        command.userId,
        true,
      );*/
      /*await this.likesRepository.setLikesOwnerBanStatus(
        command.userId,
        true,
        this.PostModel,
      );*/
      /*await this.likesRepository.setLikesOwnerBanStatus(
        command.userId,
        true,
        this.CommentModel,
      );*/
    } else {
      await this.usersRepository.unbanUser(user.id);
      /*await this.blogsRepository.setBlogsOwnerBanStatus(command.userId, false);*/
      /*await this.postsRepository.setPostsOwnerBanStatus(command.userId, false);*/
      /*await this.commentsRepository.setCommentsOwnerBanStatus(
        command.userId,
        false,
      );*/
      /*await this.likesRepository.setLikesOwnerBanStatus(
        command.userId,
        false,
        this.PostModel,
      );*/
      /*await this.likesRepository.setLikesOwnerBanStatus(
        command.userId,
        false,
        this.CommentModel,
      );*/
    }

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
