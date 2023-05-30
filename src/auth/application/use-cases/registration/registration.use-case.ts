import { InjectModel } from '@nestjs/mongoose';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../api/infrastructure/users/users.repository';
import { UserInputDto } from '../../../../api/dto/users/input/user-input.dto';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import {
  User,
  UserDocument,
  UserModelType,
} from '../../../../api/entities/user.entity';
import { SendRegistrationMailCommand } from '../../../../mail/application/use-cases/send-registration-mail.use-case';

export class RegistrationCommand {
  constructor(public userInputDto: UserInputDto) {}
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase
  implements ICommandHandler<RegistrationCommand>
{
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private commandBus: CommandBus,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: RegistrationCommand): Promise<UserDocument | null> {
    const hash = await bcrypt.hash(
      command.userInputDto.password,
      Number(process.env.HASH_ROUNDS),
    );

    const emailData = {
      confirmationCode: randomUUID(),
      expirationDate: add(new Date(), { hours: 1 }),
      isConfirmed: false,
    };

    const user = this.UserModel.createUser(
      this.UserModel,
      command.userInputDto,
      hash,
      emailData,
    );

    const result = await this.usersRepository.save(user);

    try {
      await this.commandBus.execute(
        new SendRegistrationMailCommand(
          command.userInputDto.login,
          command.userInputDto.email,
          emailData.confirmationCode,
        ),
      );
    } catch (error) {
      console.error(error);
      await this.usersRepository.deleteUser(user.id);
      return null;
    }

    return result;
  }
}
