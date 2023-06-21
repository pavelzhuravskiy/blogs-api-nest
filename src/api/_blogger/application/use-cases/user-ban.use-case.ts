import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResultCode } from '../../../../enums/result-code.enum';
import {
  userIDField,
  userIsAlreadyBanned,
  userNotFound,
} from '../../../../exceptions/exception.constants';
import { ExceptionResultType } from '../../../../exceptions/types/exception-result.type';
import { BloggerUserBanInputDto } from '../../../dto/users/input/blogger/blogger.user-ban.input.dto';
import { UsersRepository } from '../../../infrastructure/repositories/users/users.repository';
import { BlogsRepository } from '../../../infrastructure/repositories/blogs/blogs.repository';

export class BloggerUserBanCommand {
  constructor(
    public bloggerUserBanInputDto: BloggerUserBanInputDto,
    public userToBanOrUnbanId: string,
    public currentUserId: number,
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
    const userToBanOrUnban = await this.usersRepository.findUserById(
      +command.userToBanOrUnbanId,
    );

    if (!userToBanOrUnban) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: userIDField,
        message: userNotFound,
      };
    }

    const blog = await this.blogsRepository.findBlog(
      command.bloggerUserBanInputDto.blogId,
    );

    if (blog.ownerId !== command.currentUserId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    const isAlreadyBanned = await this.usersRepository.findUserBanForBlog(
      userToBanOrUnban.id,
      blog.id,
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

      await this.usersRepository.banUserByBlogger(
        userToBanOrUnban.id,
        blog.id,
        command.bloggerUserBanInputDto.banReason,
      );
    } else {
      await this.usersRepository.unbanUserByBlogger(
        userToBanOrUnban.id,
        blog.id,
      );
    }

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
