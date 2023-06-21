import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { EmailInputDto } from '../../../dto/email.input.dto';
import { SendPasswordRecoveryMailCommand } from '../../../../infrastructure/mail/application/use-cases/send-pass-recovery-mail.use-case';
import { UsersRepository } from '../../../../infrastructure/repositories/users/users.repository';

export class PasswordRecoveryCommand {
  constructor(public emailInputDto: EmailInputDto) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    private commandBus: CommandBus,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: PasswordRecoveryCommand): Promise<number> {
    const user = await this.usersRepository.findUserByEmail(
      command.emailInputDto.email,
    );

    if (!user) {
      return null;
    }

    const recoveryCode = randomUUID();

    const result = await this.usersRepository.createPasswordRecoveryRecord(
      recoveryCode,
      user.id,
    );

    try {
      await this.commandBus.execute(
        new SendPasswordRecoveryMailCommand(
          user.login,
          user.email,
          recoveryCode,
        ),
      );
    } catch (error) {
      console.error(error);
      return null;
    }

    return result;
  }
}
