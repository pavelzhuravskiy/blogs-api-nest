import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/repositories/users/users.repository';
import { randomUUID } from 'crypto';
import { DataSourceRepository } from '../../../infrastructure/repositories/common/data-source.repository';
import { BlogSubscriber } from '../../../entities/blogs/blog-subscriber.entity';
import { BlogSubscribersRepository } from '../../../infrastructure/repositories/blogs/blog-subscribers.repository';
import { SubscriptionStatus } from '../../../../enums/subscription-status.enum';

export class TelegramBotGetAuthLinkQuery {
  constructor(public userId: string) {}
}

@QueryHandler(TelegramBotGetAuthLinkQuery)
export class TelegramBotGetAuthLinkUseCase
  implements IQueryHandler<TelegramBotGetAuthLinkQuery>
{
  constructor(
    private readonly dataSourceRepository: DataSourceRepository,
    private readonly usersRepository: UsersRepository,
    private readonly blogSubscribersRepository: BlogSubscribersRepository,
  ) {}

  async execute(query: TelegramBotGetAuthLinkQuery): Promise<{ link: string }> {
    const user = await this.usersRepository.findUserById(query.userId);

    if (!user) {
      return null;
    }

    const telegramCode = randomUUID();

    let subscriber = await this.blogSubscribersRepository.findActiveSubscriber(
      query.userId,
    );

    if (!subscriber) {
      subscriber = new BlogSubscriber();
      subscriber.subscriptionStatus = SubscriptionStatus.None;
      subscriber.user = user;
    }

    subscriber.telegramCode = telegramCode;
    await this.dataSourceRepository.save(subscriber);

    // TODO Remove start=
    return {
      link: `https://t.me/blogger_platform_bot?start=code=${subscriber.telegramCode}`,
    };
  }
}
