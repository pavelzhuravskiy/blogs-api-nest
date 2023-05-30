import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../api/infrastructure/users/users.repository';
import { UserDocument } from '../../../../api/entities/user.entity';
import { NewPasswordInputDto } from '../../../dto/new-password.input.dto';
import bcrypt from 'bcrypt';

export class PasswordUpdateCommand {
  constructor(public newPasswordDto: NewPasswordInputDto) {}
}

@CommandHandler(PasswordUpdateCommand)
export class PasswordUpdateUseCase
  implements ICommandHandler<PasswordUpdateCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: PasswordUpdateCommand): Promise<UserDocument | null> {
    const user = await this.usersRepository.findUserByRecoveryCode(
      command.newPasswordDto.recoveryCode,
    );

    if (!user || !user.passwordCanBeUpdated()) {
      return null;
    }

    const hash = await bcrypt.hash(
      command.newPasswordDto.newPassword,
      Number(process.env.HASH_ROUNDS),
    );

    await user.updatePassword(hash);
    return this.usersRepository.save(user);
  }
}
