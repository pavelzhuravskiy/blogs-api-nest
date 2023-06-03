import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import bcrypt from 'bcrypt';
import { UserInputDto } from '../../../../dto/users/input/user-input.dto';
import { UsersRepository } from '../../../../infrastructure/users/users.repository';

export class UserCreateCommand {
  constructor(public userInputDto: UserInputDto) {}
}

@CommandHandler(UserCreateCommand)
export class UserCreateUseCase implements ICommandHandler<UserCreateCommand> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: UserCreateCommand): Promise<string | null> {
    const hash = await bcrypt.hash(
      command.userInputDto.password,
      Number(process.env.HASH_ROUNDS),
    );

    return this.usersRepository.createUser(command.userInputDto, hash);
  }
}
