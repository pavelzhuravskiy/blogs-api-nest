import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../users/infrastructure/users.repository';
import { UserInputDto } from '../../../../users/dto/user-input.dto';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import {
  User,
  UserDocument,
  UserModelType,
} from '../../../../users/user.entity';
import { MailService } from '../../../../mail/mail.service';

export class RegisterUserCommand {
  constructor(public userInputDto: UserInputDto) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase
  implements ICommandHandler<RegisterUserCommand>
{
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private readonly mailService: MailService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: RegisterUserCommand): Promise<UserDocument | null> {
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
      await this.mailService.sendRegistrationMail(
        command.userInputDto.login,
        command.userInputDto.email,
        emailData.confirmationCode,
      );
    } catch (error) {
      console.error(error);
      await this.usersRepository.deleteUser(user.id);
      return null;
    }

    return result;
  }
}
