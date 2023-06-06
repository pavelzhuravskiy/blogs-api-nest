import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { EmailInputDto } from '../../../dto/email.input.dto';
import { SendRegistrationMailCommand } from '../../../../../mail/application/use-cases/send-registration-mail.use-case';
import { UsersRepository } from '../../../../infrastructure/users/users.repository';

export class RegistrationEmailResendCommand {
  constructor(public emailInputDto: EmailInputDto) {}
}

@CommandHandler(RegistrationEmailResendCommand)
export class RegistrationEmailResendUseCase
  implements ICommandHandler<RegistrationEmailResendCommand>
{
  constructor(
    private commandBus: CommandBus,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: RegistrationEmailResendCommand): Promise<any> {
    const user = await this.usersRepository.findUserForEmailResend(
      command.emailInputDto.email,
    );

    if (!user || user.isConfirmed) {
      return null;
    }

    const newConfirmationCode = randomUUID();

    const result = await this.usersRepository.updateEmailConfirmationData(
      newConfirmationCode,
      user.id,
    );

    try {
      await this.commandBus.execute(
        new SendRegistrationMailCommand(
          user.login,
          user.email,
          newConfirmationCode,
        ),
      );
    } catch (error) {
      console.error(error);
      return null;
    }

    return result;
  }
}
