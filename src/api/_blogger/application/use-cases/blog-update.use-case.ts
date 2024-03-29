import { BlogInputDto } from '../../../dto/blogs/input/blog.input.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExceptionResultType } from '../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../enums/result-code.enum';
import {
  blogIDField,
  blogNotFound,
} from '../../../../exceptions/exception.constants';
import { BlogsRepository } from '../../../infrastructure/repositories/blogs/blogs.repository';
import { DataSourceRepository } from '../../../infrastructure/repositories/common/data-source.repository';

export class BlogUpdateCommand {
  constructor(
    public blogInputDto: BlogInputDto,
    public blogId: string,
    public userId: string,
  ) {}
}

@CommandHandler(BlogUpdateCommand)
export class BlogUpdateUseCase implements ICommandHandler<BlogUpdateCommand> {
  constructor(
    private readonly dataSourceRepository: DataSourceRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(
    command: BlogUpdateCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const blog = await this.blogsRepository.findBlogWithOwner(command.blogId);

    if (!blog) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: blogIDField,
        message: blogNotFound,
      };
    }

    if (blog.user.id !== command.userId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    blog.name = command.blogInputDto.name;
    blog.description = command.blogInputDto.description;
    blog.websiteUrl = command.blogInputDto.websiteUrl;
    await this.dataSourceRepository.save(blog);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
