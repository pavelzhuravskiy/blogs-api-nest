import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../infrastructure/users/users.repository';

export class UserDeleteCommand {
  constructor(public userId: number) {}
}

@CommandHandler(UserDeleteCommand)
export class UserDeleteUseCase implements ICommandHandler<UserDeleteCommand> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: UserDeleteCommand): Promise<boolean> {
    const user = await this.usersRepository.findUserById(command.userId);

    if (!user) {
      return null;
    }

    return this.usersRepository.deleteUser(command.userId);
  }
}
