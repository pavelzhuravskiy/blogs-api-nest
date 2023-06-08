import { BlogInputDto } from '../../../dto/blogs/input/blog.input.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExceptionResultType } from '../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../enums/result-code.enum';
import {
  blogIDField,
  blogNotFound,
} from '../../../../exceptions/exception.constants';
import { BlogsRepository } from '../../../infrastructure/blogs/blogs.repository';

export class BlogUpdateCommand {
  constructor(
    public blogInputDto: BlogInputDto,
    public blogId: number,
    public userId: number,
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

    if (blog.ownerId !== command.userId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    await this.blogsRepository.updateBlog(command.blogInputDto, blog.id);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
