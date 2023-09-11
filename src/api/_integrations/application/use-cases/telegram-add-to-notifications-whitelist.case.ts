import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSourceRepository } from '../../../infrastructure/repositories/common/data-source.repository';
import { BlogSubscribersRepository } from '../../../infrastructure/repositories/blogs/blog-subscribers.repository';
import { TypeORMEntity } from '../../../../types/typeorm-entity';

export class TelegramAddToNotificationsWhitelistCommand {
  constructor(
    public telegramId: number,
    public telegramCode: string, // public userId: string,
  ) {}
}

@CommandHandler(TelegramAddToNotificationsWhitelistCommand)
export class TelegramAddToNotificationsWhitelistUseCase
  implements ICommandHandler<TelegramAddToNotificationsWhitelistCommand>
{
  constructor(
    private readonly dataSourceRepository: DataSourceRepository,
    private readonly blogSubscribersRepository: BlogSubscribersRepository,
  ) {}

  async execute(
    command: TelegramAddToNotificationsWhitelistCommand,
  ): Promise<TypeORMEntity | null> {
    const startMessage = command.telegramCode.split('=');
    const codeToCheck = startMessage[1];

    const subscriber =
      await this.blogSubscribersRepository.findSubscriberByTelegramCode(
        codeToCheck,
      );

    if (!subscriber) {
      return null;
    }

    subscriber.telegramId = command.telegramId;
    return this.dataSourceRepository.save(subscriber);
  }
}
