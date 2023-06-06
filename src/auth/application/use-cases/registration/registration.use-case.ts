import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserInputDto } from '../../../../api/dto/users/input/user-input.dto';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { SendRegistrationMailCommand } from '../../../../mail/application/use-cases/send-registration-mail.use-case';
import { UsersRepository } from '../../../../api/infrastructure/users/users.repository';

export class RegistrationCommand {
  constructor(public userInputDto: UserInputDto) {}
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase
  implements ICommandHandler<RegistrationCommand>
{
  constructor(
    private commandBus: CommandBus,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: RegistrationCommand): Promise<number | null> {
    const hash = await bcrypt.hash(
      command.userInputDto.password,
      Number(process.env.HASH_ROUNDS),
    );

    const code = randomUUID();

    const userId = await this.usersRepository.registerUser(
      command.userInputDto,
      hash,
      code,
    );

    try {
      await this.commandBus.execute(
        new SendRegistrationMailCommand(
          command.userInputDto.login,
          command.userInputDto.email,
          code,
        ),
      );
    } catch (error) {
      console.error(error);
      await this.usersRepository.deleteUser(userId);
      return null;
    }

    return userId;
  }
}
