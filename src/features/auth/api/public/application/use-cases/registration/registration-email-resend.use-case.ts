import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../../../users/infrastructure/users.repository';
import { randomUUID } from 'crypto';
import { UserDocument } from '../../../../../../users/user.entity';
import { EmailInputDto } from '../../../../../dto/email.input.dto';
import { SendRegistrationMailCommand } from '../../../../../../mail/application/use-cases/send-registration-mail.use-case';

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

  async execute(
    command: RegistrationEmailResendCommand,
  ): Promise<UserDocument | null> {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      command.emailInputDto.email,
    );

    if (!user || user.emailConfirmation.isConfirmed) {
      return null;
    }

    const newConfirmationCode = randomUUID();

    await user.updateEmailConfirmationData(newConfirmationCode);
    const result = await this.usersRepository.save(user);

    try {
      await this.commandBus.execute(
        new SendRegistrationMailCommand(
          user.accountData.login,
          user.accountData.email,
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
