import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSourceRepository } from '../../../infrastructure/repositories/common/data-source.repository';
import { BlogSubscribersRepository } from '../../../infrastructure/repositories/blogs/blog-subscribers.repository';

export class MockTelegramIdCommand {}

@CommandHandler(MockTelegramIdCommand)
export class MockTelegramIdUseCase
  implements ICommandHandler<MockTelegramIdCommand>
{
  constructor(
    private readonly dataSourceRepository: DataSourceRepository,
    private readonly blogSubscribersRepository: BlogSubscribersRepository,
  ) {}

  async execute(): Promise<boolean> {
    const subscribers =
      await this.blogSubscribersRepository.findSubscribersForTelegramMock();

    subscribers[0].telegramId = 57625927;
    // subscribers[1].telegramId = 96251443;

    await this.dataSourceRepository.save(subscribers[0]);
    // await this.dataSourceRepository.save(subscribers[1]);

    return true;
  }
}
