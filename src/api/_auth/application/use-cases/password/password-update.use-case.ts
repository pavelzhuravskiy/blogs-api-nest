import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NewPasswordInputDto } from '../../../dto/new-password.input.dto';
import bcrypt from 'bcrypt';
import { UsersRepository } from '../../../../infrastructure/users/users.repository';

export class PasswordUpdateCommand {
  constructor(public newPasswordDto: NewPasswordInputDto) {}
}

@CommandHandler(PasswordUpdateCommand)
export class PasswordUpdateUseCase
  implements ICommandHandler<PasswordUpdateCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: PasswordUpdateCommand): Promise<boolean> {
    const recoveryRecord =
      await this.usersRepository.findPasswordRecoveryRecord(
        command.newPasswordDto.recoveryCode,
      );

    if (!recoveryRecord || recoveryRecord.expirationDate < new Date()) {
      return null;
    }

    const hash = await bcrypt.hash(
      command.newPasswordDto.newPassword,
      Number(process.env.HASH_ROUNDS),
    );

    return this.usersRepository.updatePassword(recoveryRecord.userId, hash);
  }
}
