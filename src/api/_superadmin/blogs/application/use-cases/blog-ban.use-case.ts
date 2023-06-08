import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResultCode } from '../../../../../enums/result-code.enum';
import {
  blogIDField,
  blogIsAlreadyBanned,
  blogIsAlreadyUnbanned,
  blogNotFound,
} from '../../../../../exceptions/exception.constants';
import { ExceptionResultType } from '../../../../../exceptions/types/exception-result.type';
import { BlogsMongooseRepository } from '../../../../infrastructure/_mongoose/blogs/blogs.repository';
import { SABlogBanInputDto } from '../../../../dto/users/input/superadmin/sa.blog-ban.input.dto';
import { PostsMongooseRepository } from '../../../../infrastructure/_mongoose/posts/posts.repository';

export class SABlogBanCommand {
  constructor(
    public saBlogBanInputDto: SABlogBanInputDto,
    public blogId: string,
  ) {}
}

@CommandHandler(SABlogBanCommand)
export class BlogBanUseCase implements ICommandHandler<SABlogBanCommand> {
  constructor(
    private readonly blogsRepository: BlogsMongooseRepository,
    private readonly postsRepository: PostsMongooseRepository,
  ) {}

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

    const banDBStatus = blog.banInfo.isBanned;

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
      blog.banBlog();
      await this.postsRepository.setPostsBanStatus(command.blogId, true);
    } else {
      blog.unbanBlog();
      await this.postsRepository.setPostsBanStatus(command.blogId, false);
    }

    await this.blogsRepository.save(blog);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
