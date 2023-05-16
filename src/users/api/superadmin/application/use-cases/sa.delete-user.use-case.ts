import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../infrastructure/users.repository';
import { User, UserModelType } from '../../../../user.entity';

export class SuperAdminDeleteUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(SuperAdminDeleteUserCommand)
export class SuperAdminDeleteUserUseCase
  implements ICommandHandler<SuperAdminDeleteUserCommand>
{
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: SuperAdminDeleteUserCommand): Promise<boolean> {
    const user = await this.usersRepository.findUserById(command.userId);

    if (!user) {
      return null;
    }

    return this.usersRepository.deleteUser(command.userId);
  }
}
