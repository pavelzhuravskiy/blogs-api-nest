import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../users/infrastructure/users.repository';
import { UserDocument } from '../../../../users/user.entity';
import { NewPasswordInputDto } from '../../../dto/new-password.input.dto';
import bcrypt from 'bcrypt';

export class UpdatePasswordCommand {
  constructor(public newPasswordDto: NewPasswordInputDto) {}
}

@CommandHandler(UpdatePasswordCommand)
export class UpdatePasswordUseCase
  implements ICommandHandler<UpdatePasswordCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: UpdatePasswordCommand): Promise<UserDocument | null> {
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
