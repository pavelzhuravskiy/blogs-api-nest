import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import bcrypt from 'bcrypt';
import { UsersMongooseRepository } from '../../../../api/infrastructure/_mongoose/users/users.mongoose.repository';

export class ValidateLoginAndPasswordCommand {
  constructor(public loginOrEmail: string, public password: string) {}
}

@CommandHandler(ValidateLoginAndPasswordCommand)
export class ValidateLoginAndPasswordUseCase
  implements ICommandHandler<ValidateLoginAndPasswordCommand>
{
  constructor(private readonly usersRepository: UsersMongooseRepository) {}

  async execute(command: ValidateLoginAndPasswordCommand) {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      command.loginOrEmail,
    );

    if (!user || !user.emailConfirmation.isConfirmed || user.banInfo.isBanned) {
      return null;
    }

    const result = await bcrypt.compare(
      command.password,
      user.accountData.passwordHash,
    );

    if (result) {
      return user;
    }

    return null;
  }
}
