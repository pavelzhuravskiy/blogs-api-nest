import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailInputDto } from '../../../dto/email.input.dto';
import { UsersRepository } from '../../../../infrastructure/repositories/users/users.repository';
import { MailAdapter } from '../../../../infrastructure/mail/mail-adapter';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';

export class RegistrationEmailResendCommand {
  constructor(public emailInputDto: EmailInputDto) {}
}

@CommandHandler(RegistrationEmailResendCommand)
export class RegistrationEmailResendUseCase
  implements ICommandHandler<RegistrationEmailResendCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly mailAdapter: MailAdapter,
  ) {}

  async execute(
    command: RegistrationEmailResendCommand,
  ): Promise<boolean | null> {
    const user = await this.usersRepository.findUserForEmailResend(
      command.emailInputDto.email,
    );

    if (!user || user.isConfirmed) {
      return null;
    }

    const newConfirmationCode = randomUUID();
    user.userEmailConfirmation.confirmationCode = newConfirmationCode;
    user.userEmailConfirmation.expirationDate = add(new Date(), { hours: 1 });
    await this.usersRepository.dataSourceSave(user.userEmailConfirmation);

    await this.resendRegistrationMail(
      user.login,
      user.email,
      newConfirmationCode,
    );

    return true;
  }

  private async resendRegistrationMail(
    login: string,
    email: string,
    confirmationCode: string,
  ): Promise<any> {
    try {
      await this.mailAdapter.sendRegistrationMail(
        login,
        email,
        confirmationCode,
      );
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}
