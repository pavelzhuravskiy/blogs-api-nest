import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../../../../blog.entity';
import { BlogsRepository } from '../../../../infrastructure/blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../../users/infrastructure/users.repository';
import { ResultCode } from '../../../../../exceptions/exception-codes.enum';
import {
  blogIDField,
  blogIsBound,
  blogNotFound,
  userIDField,
  userNotFound,
} from '../../../../../exceptions/exception.constants';
import { ExceptionResultType } from '../../../../../exceptions/types/exception-result.type';

export class SuperAdminBindBlogCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(SuperAdminBindBlogCommand)
export class SuperAdminBindBlogUseCase
  implements ICommandHandler<SuperAdminBindBlogCommand>
{
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    private readonly blogsRepository: BlogsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(
    command: SuperAdminBindBlogCommand,
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

    if (blog.blogOwnerInfo.userId) {
      return {
        data: false,
        code: ResultCode.BadRequest,
        field: blogIDField,
        message: blogIsBound,
      };
    }

    blog.bindUser(user);
    await this.blogsRepository.save(blog);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
