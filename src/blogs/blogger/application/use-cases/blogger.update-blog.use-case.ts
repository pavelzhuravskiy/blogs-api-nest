import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../../../_common/blog.entity';
import { BlogInputDto } from '../../../_common/dto/blog-input.dto';
import { BlogsRepository } from '../../../_common/infrastructure/blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExceptionResultType } from '../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../exceptions/exception-codes.enum';
import {
  blogIDField,
  blogNotFound,
} from '../../../../exceptions/exception.constants';

export class BloggerUpdateBlogCommand {
  constructor(
    public blogInputDto: BlogInputDto,
    public blogId: string,
    public userId: string,
  ) {}
}

@CommandHandler(BloggerUpdateBlogCommand)
export class BloggerUpdateBlogUseCase
  implements ICommandHandler<BloggerUpdateBlogCommand>
{
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(
    command: BloggerUpdateBlogCommand,
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

    await blog.updateBlog(command.blogInputDto);
    await this.blogsRepository.save(blog);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
