import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/repositories/users/users.repository';
import { randomUUID } from 'crypto';
import { DataSourceRepository } from '../../../infrastructure/repositories/common/data-source.repository';

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
  ) {}

  async execute(query: TelegramBotGetAuthLinkQuery): Promise<{ link: string }> {
    const user = await this.usersRepository.findUserById(query.userId);

    if (!user) {
      return null;
    }

    const telegramId = randomUUID();
    user.telegramId = telegramId;

    await this.dataSourceRepository.save(user);

    return {
      link: `https://t.me/blogger_platform_bot?code=${telegramId}`,
    };
  }
}
