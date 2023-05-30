import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { ResultCode } from '../../../../enums/result-code.enum';
import {
  userIDField,
  userIsAlreadyBanned,
  userIsAlreadyUnbanned,
  userNotFound,
} from '../../../../exceptions/exception.constants';
import { ExceptionResultType } from '../../../../exceptions/types/exception-result.type';
import { BloggerUserBanInputDto } from '../../../dto/users/input/blogger/blogger.user-ban.input.dto';

export class BloggerUserBanCommand {
  constructor(
    public bloggerUserBanInputDto: BloggerUserBanInputDto,
    public userId: string,
  ) {}
}

@CommandHandler(BloggerUserBanCommand)
export class BloggerUserBanUseCase
  implements ICommandHandler<BloggerUserBanCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(
    command: BloggerUserBanCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const user = await this.usersRepository.findUserById(command.userId);

    if (!user) {
      return {
        data: false,
        code: ResultCode.BadRequest,
        field: userIDField,
        message: userNotFound,
      };
    }

    const isAlreadyBanned = await this.usersRepository.findUserBanForBlog(
      command.userId,
      command.bloggerUserBanInputDto.blogId,
    );

    if (command.bloggerUserBanInputDto.isBanned) {
      if (isAlreadyBanned) {
        return {
          data: false,
          code: ResultCode.BadRequest,
          field: userIDField,
          message: userIsAlreadyBanned,
        };
      }

      await this.usersRepository.banUserForBlog(
        command.bloggerUserBanInputDto.blogId,
        command.userId,
        user.accountData.login,
        command.bloggerUserBanInputDto.banReason,
      );
    } else {
      if (!isAlreadyBanned) {
        return {
          data: false,
          code: ResultCode.BadRequest,
          field: userIDField,
          message: userIsAlreadyUnbanned,
        };
      }

      await this.usersRepository.unbanUserForBlog(
        command.bloggerUserBanInputDto.blogId,
        command.userId,
      );
    }

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
