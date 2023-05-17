import { BlogInputDto } from '../../../../dto/blog.input.dto';
import { BlogsRepository } from '../../../../infrastructure/blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExceptionResultType } from '../../../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../../../enum/result-code.enum';
import {
  blogIDField,
  blogNotFound,
} from '../../../../../../exceptions/exception.constants';

export class BlogUpdateCommand {
  constructor(
    public blogInputDto: BlogInputDto,
    public blogId: string,
    public userId: string,
  ) {}
}

@CommandHandler(BlogUpdateCommand)
export class BlogUpdateUseCase implements ICommandHandler<BlogUpdateCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(
    command: BlogUpdateCommand,
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
