import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExceptionResultType } from '../../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../../enums/result-code.enum';
import {
  blogIDField,
  blogNotFound,
  userIDField,
  userNotFound,
} from '../../../../../exceptions/exception.constants';
import { UsersRepository } from '../../../../infrastructure/repositories/users/users.repository';
import { DataSourceRepository } from '../../../../infrastructure/repositories/common/data-source.repository';
import { BlogsRepository } from '../../../../infrastructure/repositories/blogs/blogs.repository';
import { BlogSubscribersRepository } from '../../../../infrastructure/repositories/blogs/blog-subscribers.repository';
import { SubscriptionStatus } from '../../../../../enums/subscription-status.enum';

export class BlogUnsubscribeCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(BlogUnsubscribeCommand)
export class BlogUnsubscribeUseCase
  implements ICommandHandler<BlogUnsubscribeCommand>
{
  constructor(
    private readonly dataSourceRepository: DataSourceRepository,
    private readonly blogsRepository: BlogsRepository,
    private readonly blogSubscribersRepository: BlogSubscribersRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(
    command: BlogUnsubscribeCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const blog = await this.blogsRepository.findBlogById(command.blogId);

    if (!blog) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: blogIDField,
        message: blogNotFound,
      };
    }

    const user = await this.usersRepository.findUserById(command.userId);

    if (!user) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: userIDField,
        message: userNotFound,
      };
    }

    const subscriber =
      await this.blogSubscribersRepository.findRecordForUnsubscribe(
        command.blogId,
        command.userId,
      );

    if (subscriber) {
      subscriber.subscriptionStatus = SubscriptionStatus.Unsubscribed;
      await this.dataSourceRepository.save(subscriber);
    }

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
