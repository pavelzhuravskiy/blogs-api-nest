import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfirmCodeInputDto } from '../../../dto/confirm-code.input.dto';
import { UsersRepository } from '../../../../infrastructure/users/users.repository';

export class RegistrationConfirmationCommand {
  constructor(public confirmCodeInputDto: ConfirmCodeInputDto) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase
  implements ICommandHandler<RegistrationConfirmationCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: RegistrationConfirmationCommand): Promise<boolean> {
    const user = await this.usersRepository.findUserForEmailConfirm(
      command.confirmCodeInputDto.code,
    );

    if (!user || user.isConfirmed || user.expirationDate < new Date()) {
      return null;
    }

    return this.usersRepository.confirmUser(user.id);
  }
}
