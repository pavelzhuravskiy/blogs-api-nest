import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../infrastructure/users.repository';

export class UsersFindNotBannedCommand {}

@CommandHandler(UsersFindNotBannedCommand)
export class UsersFindNotBannedUseCase
  implements ICommandHandler<UsersFindNotBannedCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute() {
    const users = await this.usersRepository.findNotBannedUsersIDs();
    return users.map((u) => u._id.toString());
  }
}
