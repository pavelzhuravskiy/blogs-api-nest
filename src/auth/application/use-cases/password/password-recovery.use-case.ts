import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersMongooseRepository } from '../../../../api/infrastructure/_mongoose/users/users.mongoose.repository';
import { randomUUID } from 'crypto';
import { UserDocument } from '../../../../api/entities/_mongoose/user.entity';
import { EmailInputDto } from '../../../dto/email.input.dto';
import { SendPasswordRecoveryMailCommand } from '../../../../mail/application/use-cases/send-pass-recovery-mail.use-case';

export class PasswordRecoveryCommand {
  constructor(public emailInputDto: EmailInputDto) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    private commandBus: CommandBus,
    private readonly usersRepository: UsersMongooseRepository,
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
      await this.commandBus.execute(
        new SendPasswordRecoveryMailCommand(
          user.accountData.login,
          user.accountData.email,
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
