import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import bcrypt from 'bcrypt';
import { UsersRepository } from '../../../../infrastructure/users/users.repository';

export class ValidateLoginAndPasswordCommand {
  constructor(public loginOrEmail: string, public password: string) {}
}

@CommandHandler(ValidateLoginAndPasswordCommand)
export class ValidateLoginAndPasswordUseCase
  implements ICommandHandler<ValidateLoginAndPasswordCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: ValidateLoginAndPasswordCommand) {
    const user = await this.usersRepository.findUserForLoginValidation(
      command.loginOrEmail,
    );

    if (!user || !user.isConfirmed /*|| user.isBanned*/) {
      return null;
    }

    const result = await bcrypt.compare(command.password, user.passwordHash);

    if (result) {
      return user;
    }

    return null;
  }
}
