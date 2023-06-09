import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResultCode } from '../../../../../enums/result-code.enum';
import {
  blogIDField,
  blogIsBound,
  blogNotFound,
  userIDField,
  userNotFound,
} from '../../../../../exceptions/exception.constants';
import { ExceptionResultType } from '../../../../../exceptions/types/exception-result.type';
import { BlogsRepository } from '../../../../infrastructure/blogs/blogs.repository';
import { UsersRepository } from '../../../../infrastructure/users/users.repository';

export class BlogBindCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(BlogBindCommand)
export class BlogBindUseCase implements ICommandHandler<BlogBindCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(
    command: BlogBindCommand,
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

    const user = await this.usersRepository.findUserById(command.userId);

    if (!user) {
      return {
        data: false,
        code: ResultCode.BadRequest,
        field: userIDField,
        message: userNotFound,
      };
    }

    const blogOwnerId = blog.ownerId;
    const blogOwner = await this.usersRepository.findUserById(blogOwnerId);

    if (blogOwner) {
      return {
        data: false,
        code: ResultCode.BadRequest,
        field: blogIDField,
        message: blogIsBound,
      };
    }

    // await this.blogsRepository.bindBlog(blog);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
