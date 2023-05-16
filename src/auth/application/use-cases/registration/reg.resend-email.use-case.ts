import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../users/infrastructure/users.repository';
import { randomUUID } from 'crypto';
import {
  User,
  UserDocument,
  UserModelType,
} from '../../../../users/user.entity';
import { MailService } from '../../../../mail/mail.service';
import { EmailInputDto } from '../../../dto/email.input.dto';

export class ResendEmailCommand {
  constructor(public emailInputDto: EmailInputDto) {}
}

@CommandHandler(ResendEmailCommand)
export class ResendEmailUseCase implements ICommandHandler<ResendEmailCommand> {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private readonly mailService: MailService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: ResendEmailCommand): Promise<UserDocument | null> {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      command.emailInputDto.email,
    );

    if (!user || user.emailConfirmation.isConfirmed) {
      return null;
    }

    const newConfirmationCode = randomUUID();

    await user.updateEmailConfirmationData(newConfirmationCode);
    const result = await this.usersRepository.save(user);

    try {
      await this.mailService.sendRegistrationMail(
        user.accountData.login,
        user.accountData.email,
        newConfirmationCode,
      );
    } catch (error) {
      console.error(error);
      return null;
    }

    return result;
  }
}
