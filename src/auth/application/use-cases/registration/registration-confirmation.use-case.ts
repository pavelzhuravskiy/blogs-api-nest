import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersMongooseRepository } from '../../../../api/infrastructure/_mongoose/users/users.mongoose.repository';
import { UserDocument } from '../../../../api/entities/_mongoose/user.entity';
import { ConfirmCodeInputDto } from '../../../dto/confirm-code.input.dto';

export class RegistrationConfirmationCommand {
  constructor(public confirmCodeInputDto: ConfirmCodeInputDto) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase
  implements ICommandHandler<RegistrationConfirmationCommand>
{
  constructor(private readonly usersRepository: UsersMongooseRepository) {}

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
