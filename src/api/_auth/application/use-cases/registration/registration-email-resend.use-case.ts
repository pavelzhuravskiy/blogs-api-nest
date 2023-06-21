import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailInputDto } from '../../../dto/email.input.dto';
import { UsersRepository } from '../../../../infrastructure/repositories/users/users.repository';
import { MailAdapter } from '../../../../infrastructure/mail/mail-adapter';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { UserEmailConfirmation } from '../../../../entities/users/user-email-confirmation.entity';

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
    private readonly emailAdapter: MailAdapter,
  ) {}

  async execute(
    command: RegistrationEmailResendCommand,
  ): Promise<UserEmailConfirmation> {
    const user = await this.usersRepository.findUserForEmailResend(
      command.emailInputDto.email,
    );

    if (
      !user ||
      user.isConfirmed ||
      user.userEmailConfirmation.expirationDate < new Date()
    ) {
      return null;
    }

    const newConfirmationCode = randomUUID();
    user.userEmailConfirmation.confirmationCode = newConfirmationCode;
    user.userEmailConfirmation.expirationDate = add(new Date(), { hours: 1 });
    const result = await this.usersRepository.dataSourceSave(
      user.userEmailConfirmation,
    );

    await this.resendRegistrationMail(command, newConfirmationCode, user.login);

    return result;
  }

  private async resendRegistrationMail(
    command: RegistrationEmailResendCommand,
    confirmationCode: string,
    login: string,
  ): Promise<any> {
    try {
      await this.emailAdapter.sendRegistrationMail(
        login,
        command.emailInputDto.email,
        confirmationCode,
      );
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
