import { InjectModel } from '@nestjs/mongoose';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersMongooseRepository } from '../../../../api/infrastructure/_mongoose/users/users.mongoose.repository';
import { UserInputDto } from '../../../../api/dto/users/input/user-input.dto';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import {
  UserMongoose,
  UserDocument,
  UserModelType,
} from '../../../../api/entities/_mongoose/user.entity';
import { SendRegistrationMailCommand } from '../../../../mail/application/use-cases/send-registration-mail.use-case';

export class RegistrationCommand {
  constructor(public userInputDto: UserInputDto) {}
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase
  implements ICommandHandler<RegistrationCommand>
{
  constructor(
    @InjectModel(UserMongoose.name)
    private UserModel: UserModelType,
    private commandBus: CommandBus,
    private readonly usersRepository: UsersMongooseRepository,
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
