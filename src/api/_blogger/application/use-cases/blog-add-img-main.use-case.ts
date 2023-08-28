import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExceptionResultType } from '../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../enums/result-code.enum';
import {
  blogIDField,
  blogNotFound,
} from '../../../../exceptions/exception.constants';
import { BlogsRepository } from '../../../infrastructure/repositories/blogs/blogs.repository';
import { S3Adapter } from '../../../infrastructure/aws/s3-adapter';

export class BlogAddMainImageCommand {
  constructor(
    public blogId: string,
    public userId: string,
    public buffer: Buffer,
    public mimetype: string,
    public originalName: string,
  ) {}
}

@CommandHandler(BlogAddMainImageCommand)
export class BlogAddMainImageUseCase
  implements ICommandHandler<BlogAddMainImageCommand>
{
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly s3Adapter: S3Adapter,
  ) {}

  async execute(
    command: BlogAddMainImageCommand,
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

    await this.s3Adapter.uploadBlogMainImage(
      command.blogId,
      command.buffer,
      command.mimetype,
      command.originalName,
    );

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
