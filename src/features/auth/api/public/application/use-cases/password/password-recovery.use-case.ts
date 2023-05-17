import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../../../users/infrastructure/users.repository';
import { randomUUID } from 'crypto';
import { UserDocument } from '../../../../../../users/user.entity';
import { MailService } from '../../../../../../mail/application/mail.service';
import { EmailInputDto } from '../../../../../dto/email.input.dto';

export class PasswordRecoveryCommand {
  constructor(public emailInputDto: EmailInputDto) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly mailService: MailService,
  ) {}

  async execute(
    command: PasswordRecoveryCommand,
  ): Promise<UserDocument | null> {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      command.emailInputDto.email,
    );

    if (!user) {
      return null;
    }

    const recoveryCode = randomUUID();

    await user.updatePasswordRecoveryData(recoveryCode);
    const result = await this.usersRepository.save(user);

    try {
      await this.mailService.sendPasswordRecoveryMail(
        user.accountData.login,
        user.accountData.email,
        recoveryCode,
      );
    } catch (error) {
      console.error(error);
      return null;
    }

    return result;
  }
}
