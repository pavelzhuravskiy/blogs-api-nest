import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResultCode } from '../../../../../enums/result-code.enum';
import {
  blogIDField,
  blogIsAlreadyBanned,
  blogIsAlreadyUnbanned,
  blogNotFound,
} from '../../../../../exceptions/exception.constants';
import { ExceptionResultType } from '../../../../../exceptions/types/exception-result.type';
import { SABlogBanInputDto } from '../../../../dto/users/input/superadmin/sa.blog-ban.input.dto';
import { BlogsRepository } from '../../../../infrastructure/repositories/blogs/blogs.repository';

export class SABlogBanCommand {
  constructor(
    public saBlogBanInputDto: SABlogBanInputDto,
    public blogId: string,
  ) {}
}

@CommandHandler(SABlogBanCommand)
export class BlogBanUseCase implements ICommandHandler<SABlogBanCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(
    command: SABlogBanCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const blog = await this.blogsRepository.findBlog(command.blogId);

    if (!blog) {
      return {
        data: false,
        code: ResultCode.BadRequest,
        field: blogIDField,
        message: blogNotFound,
      };
    }

    const banDBStatus = blog.isBanned;

    if (banDBStatus && command.saBlogBanInputDto.isBanned) {
      return {
        data: false,
        code: ResultCode.BadRequest,
        field: blogIDField,
        message: blogIsAlreadyBanned,
      };
    }

    if (!banDBStatus && !command.saBlogBanInputDto.isBanned) {
      return {
        data: false,
        code: ResultCode.BadRequest,
        field: blogIDField,
        message: blogIsAlreadyUnbanned,
      };
    }

    if (!banDBStatus) {
      await this.blogsRepository.banBlog(blog.id);
    } else {
      await this.blogsRepository.unbanBlog(blog.id);
    }

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
