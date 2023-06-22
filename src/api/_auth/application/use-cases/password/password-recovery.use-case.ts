import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { EmailInputDto } from '../../../dto/email.input.dto';
import { UsersRepository } from '../../../../infrastructure/repositories/users/users.repository';
import { MailAdapter } from '../../../../infrastructure/mail/mail-adapter';
import { add } from 'date-fns';
import { UserPasswordRecovery } from '../../../../entities/users/user-password-recovery.entity';

export class PasswordRecoveryCommand {
  constructor(public emailInputDto: EmailInputDto) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly mailAdapter: MailAdapter,
  ) {}

  async execute(command: PasswordRecoveryCommand): Promise<boolean | null> {
    const user = await this.usersRepository.findUserForPasswordRecovery(
      command.emailInputDto.email,
    );

    if (!user) {
      return null;
    }

    const recoveryCode = randomUUID();

    const userPasswordRecovery = new UserPasswordRecovery();
    userPasswordRecovery.user = user;
    userPasswordRecovery.recoveryCode = recoveryCode;
    userPasswordRecovery.expirationDate = add(new Date(), { hours: 1 });

    await this.usersRepository.dataSourceSave(userPasswordRecovery);
    await this.sendPasswordRecoveryMail(user.login, user.email, recoveryCode);
    return true;
  }

  private async sendPasswordRecoveryMail(
    login: string,
    email: string,
    confirmationCode: string,
  ): Promise<any> {
    try {
      await this.mailAdapter.sendPasswordRecoveryMail(
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
