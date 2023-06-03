import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersMongooseRepository } from '../../../../infrastructure/_mongoose/users/users.mongoose.repository';

export class UserDeleteCommand {
  constructor(public userId: string) {}
}

@CommandHandler(UserDeleteCommand)
export class UserDeleteUseCase implements ICommandHandler<UserDeleteCommand> {
  constructor(private readonly usersRepository: UsersMongooseRepository) {}

  async execute(command: UserDeleteCommand): Promise<boolean> {
    const user = await this.usersRepository.findUserById(command.userId);

    if (!user) {
      return null;
    }

    return this.usersRepository.deleteUser(command.userId);
  }
}
