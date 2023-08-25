import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExceptionResultType } from '../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../enums/result-code.enum';
import {
  blogIDField,
  blogNotFound,
} from '../../../../exceptions/exception.constants';
import { BlogsRepository } from '../../../infrastructure/repositories/blogs/blogs.repository';

export class AddMainImageCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(AddMainImageCommand)
export class AddMainImageUseCase
  implements ICommandHandler<AddMainImageCommand>
{
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(
    command: AddMainImageCommand,
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

    // await this.blogsRepository.ulpoadMainImage(post.id);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
