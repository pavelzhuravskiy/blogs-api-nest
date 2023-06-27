import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResultCode } from '../../../../enums/result-code.enum';
import {
  userIDField,
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
    const userToBanOrUnban = await this.usersRepository.findUserForBanByBlogger(
      command.userToBanOrUnbanId,
    );

    if (!userToBanOrUnban) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: userIDField,
        message: userNotFound,
      };
    }

    const blog = await this.blogsRepository.findBlogWithOwner(
      command.bloggerUserBanInputDto.blogId,
    );

    if (blog.user.id !== command.currentUserId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    if (command.bloggerUserBanInputDto.isBanned) {
      userToBanOrUnban.userBanByBlogger.user = userToBanOrUnban;
      userToBanOrUnban.userBanByBlogger.blog = blog;
      userToBanOrUnban.userBanByBlogger.isBanned = true;
      userToBanOrUnban.userBanByBlogger.banReason =
        command.bloggerUserBanInputDto.banReason;
      userToBanOrUnban.userBanByBlogger.banDate = new Date();
      await this.usersRepository.dataSourceSave(
        userToBanOrUnban.userBanByBlogger,
      );
    } else {
      userToBanOrUnban.userBanByBlogger.isBanned = false;
      userToBanOrUnban.userBanByBlogger.banReason = null;
      userToBanOrUnban.userBanByBlogger.banDate = null;
      await this.usersRepository.dataSourceSave(
        userToBanOrUnban.userBanByBlogger,
      );
    }

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
