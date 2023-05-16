import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../users/infrastructure/users.repository';
import { UserDocument } from '../../../../users/user.entity';
import { ConfirmCodeInputDto } from '../../../dto/confirm-code.input.dto';

export class ConfirmUserCommand {
  constructor(public confirmCodeInputDto: ConfirmCodeInputDto) {}
}

@CommandHandler(ConfirmUserCommand)
export class ConfirmUserUseCase implements ICommandHandler<ConfirmUserCommand> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: ConfirmUserCommand): Promise<UserDocument | null> {
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
