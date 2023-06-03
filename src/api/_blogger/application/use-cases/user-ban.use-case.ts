import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersMongooseRepository } from '../../../infrastructure/_mongoose/users/users.mongoose.repository';
import { ResultCode } from '../../../../enums/result-code.enum';
import {
  userIDField,
  userIsAlreadyBanned,
  userNotFound,
} from '../../../../exceptions/exception.constants';
import { ExceptionResultType } from '../../../../exceptions/types/exception-result.type';
import { BloggerUserBanInputDto } from '../../../dto/users/input/blogger/blogger.user-ban.input.dto';
import { BlogsRepository } from '../../../infrastructure/blogs/blogs.repository';

export class BloggerUserBanCommand {
  constructor(
    public bloggerUserBanInputDto: BloggerUserBanInputDto,
    public userToBanId: string,
    public currentUserId: string,
  ) {}
}

@CommandHandler(BloggerUserBanCommand)
export class BloggerUserBanUseCase
  implements ICommandHandler<BloggerUserBanCommand>
{
  constructor(
    private readonly usersRepository: UsersMongooseRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(
    command: BloggerUserBanCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const userToBan = await this.usersRepository.findUserById(
      command.userToBanId,
    );

    if (!userToBan) {
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

    if (command.currentUserId !== blog.blogOwnerInfo.userId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    const isAlreadyBanned = await this.usersRepository.findUserBanForBlog(
      command.userToBanId,
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
        command.userToBanId,
        userToBan.accountData.login,
        command.bloggerUserBanInputDto.banReason,
      );
    } else {
      await this.usersRepository.unbanUserForBlog(
        command.bloggerUserBanInputDto.blogId,
        command.userToBanId,
      );
    }

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
