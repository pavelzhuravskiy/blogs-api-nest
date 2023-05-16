import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../../../../_common/blog.entity';
import { BlogsRepository } from '../../../../_common/infrastructure/blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExceptionResultType } from '../../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../../exceptions/exception-codes.enum';
import {
  blogIDField,
  blogNotFound,
} from '../../../../../exceptions/exception.constants';

export class BloggerDeleteBlogCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(BloggerDeleteBlogCommand)
export class BloggerDeleteBlogUseCase
  implements ICommandHandler<BloggerDeleteBlogCommand>
{
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(
    command: BloggerDeleteBlogCommand,
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
