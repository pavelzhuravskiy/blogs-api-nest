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
import { BlogSubscriber } from '../../../../entities/blogs/blog-subscriber.entity';
import { BlogSubscribersRepository } from '../../../../infrastructure/repositories/blogs/blog-subscribers.repository';
import { SubscriptionStatus } from '../../../../../enums/subscription-status.enum';

export class BlogSubscribeCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(BlogSubscribeCommand)
export class BlogSubscribeUseCase
  implements ICommandHandler<BlogSubscribeCommand>
{
  constructor(
    private readonly dataSourceRepository: DataSourceRepository,
    private readonly blogsRepository: BlogsRepository,
    private readonly blogSubscribersRepository: BlogSubscribersRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(
    command: BlogSubscribeCommand,
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

    let subscriber =
      await this.blogSubscribersRepository.findRecordForSubscribe(
        command.blogId,
        command.userId,
      );

    if (!subscriber) {
      subscriber = new BlogSubscriber();
      subscriber.user = user;
    }

    subscriber.subscriptionStatus = SubscriptionStatus.Subscribed;
    subscriber.blog = blog;

    await this.dataSourceRepository.save(subscriber);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
