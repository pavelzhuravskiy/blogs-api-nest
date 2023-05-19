import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../infrastructure/users.repository';
import { UserBanInputDto } from '../../dto/user-ban.input.dto';
import { ResultCode } from '../../../../../../enums/result-code.enum';
import {
  userIDField,
  userIsBanned,
  userIsUnbanned,
  userNotFound,
} from '../../../../../../exceptions/exception.constants';
import { ExceptionResultType } from '../../../../../../exceptions/types/exception-result.type';
import { DevicesDeleteForUserBanCommand } from '../../../../../devices/api/public/application/use-cases/devices-delete-for-user-ban.use-case';
import { PostsRepository } from '../../../../../posts/infrastructure/posts.repository';
import { BlogsRepository } from '../../../../../blogs/infrastructure/blogs.repository';
import { CommentsRepository } from '../../../../../comments/infrastructure/comments.repository';

export class UserBanCommand {
  constructor(public userBanInputDto: UserBanInputDto, public userId: string) {}
}

@CommandHandler(UserBanCommand)
export class UserBanUseCase implements ICommandHandler<UserBanCommand> {
  constructor(
    private commandBus: CommandBus,
    private readonly usersRepository: UsersRepository,
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async execute(
    command: UserBanCommand,
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

    if (banDBStatus && command.userBanInputDto.isBanned) {
      return {
        data: false,
        code: ResultCode.BadRequest,
        field: userIDField,
        message: userIsBanned,
      };
    }

    if (!banDBStatus && !command.userBanInputDto.isBanned) {
      return {
        data: false,
        code: ResultCode.BadRequest,
        field: userIDField,
        message: userIsUnbanned,
      };
    }

    if (!banDBStatus) {
      user.banUser(command.userBanInputDto);

      await this.commandBus.execute(
        new DevicesDeleteForUserBanCommand(command.userId),
      );

      await this.blogsRepository.setBlogsBanStatus(command.userId, true);
      await this.postsRepository.setPostsBanStatus(command.userId, true);
      await this.commentsRepository.setCommentsBanStatus(command.userId, true);
    } else {
      user.unbanUser();
      await this.blogsRepository.setBlogsBanStatus(command.userId, false);
      await this.postsRepository.setPostsBanStatus(command.userId, false);
      await this.commentsRepository.setCommentsBanStatus(command.userId, false);
    }

    await this.usersRepository.save(user);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
