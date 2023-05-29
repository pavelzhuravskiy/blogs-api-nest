import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../superadmin/users/infrastructure/users.repository';
import { ResultCode } from '../../../../enums/result-code.enum';
import {
  userIDField,
  userIsAlreadyBanned,
  userIsAlreadyUnbanned,
  userNotFound,
} from '../../../../exceptions/exception.constants';
import { ExceptionResultType } from '../../../../exceptions/types/exception-result.type';
import { BlogsRepository } from '../../../public/blogs/infrastructure/blogs.repository';
import { BloggerUserBanInputDto } from '../../dto/user-ban.input.dto';

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
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

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

    const blog = await this.blogsRepository.findBlog(
      command.bloggerUserBanInputDto.blogId,
    );

    const isAlreadyBanned = await this.blogsRepository.findBannedUserInBlog(
      blog.id,
      command.userId,
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

      await this.blogsRepository.pushUserInBannedUsersArray(
        blog.id,
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

      await this.blogsRepository.pullUserFromBannedUsersArray(
        blog.id,
        command.userId,
      );
    }

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
