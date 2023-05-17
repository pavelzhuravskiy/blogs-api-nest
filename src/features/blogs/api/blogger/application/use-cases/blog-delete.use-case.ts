import { BlogsRepository } from '../../../../infrastructure/blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExceptionResultType } from '../../../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../../../enum/result-code.enum';
import {
  blogIDField,
  blogNotFound,
} from '../../../../../../exceptions/exception.constants';

export class BlogDeleteCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(BlogDeleteCommand)
export class BlogDeleteUseCase implements ICommandHandler<BlogDeleteCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(
    command: BlogDeleteCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const blog = await this.blogsRepository.findBlog(command.blogId);

    if (!blog) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: blogIDField,
        message: blogNotFound,
      };
    }

    if (blog.blogOwnerInfo.userId !== command.userId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    await this.blogsRepository.deleteBlog(command.blogId);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
