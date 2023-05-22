import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../api/superadmin/users/infrastructure/users.repository';
import { UserDocument } from '../../../../api/superadmin/users/user.entity';
import { ConfirmCodeInputDto } from '../../../dto/confirm-code.input.dto';

export class RegistrationConfirmationCommand {
  constructor(public confirmCodeInputDto: ConfirmCodeInputDto) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase
  implements ICommandHandler<RegistrationConfirmationCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(
    command: RegistrationConfirmationCommand,
  ): Promise<UserDocument | null> {
    const user = await this.usersRepository.findUserByEmailCode(
      command.confirmCodeInputDto.code,
    );

    if (!user || !user.userCanBeConfirmed()) {
      return null;
    }

    await user.confirmUser();
    return this.usersRepository.save(user);
  }
}
