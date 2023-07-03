import { CommandHandler } from '@nestjs/cqrs';
import { UserInputDto } from '../../../../dto/users/input/user-input.dto';
import bcrypt from 'bcrypt';
import { UsersRepository } from '../../../../infrastructure/repositories/users/users.repository';
import { MailAdapter } from '../../../../infrastructure/mail/mail-adapter';
import { User } from '../../../../entities/users/user.entity';
import { UserBanBySA } from '../../../../entities/users/user-ban-by-sa.entity';
import { DataSource, EntityManager } from 'typeorm';
import { UserEmailConfirmation } from '../../../../entities/users/user-email-confirmation.entity';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { TransactionBaseUseCase } from '../../../../_common/application/use-cases/transaction-base.use-case';
import { UserBanByBlogger } from '../../../../entities/users/user-ban-by-blogger.entity';

export class RegistrationCommand {
  constructor(public userInputDto: UserInputDto) {}
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase extends TransactionBaseUseCase<
  RegistrationCommand,
  number
> {
  constructor(
    protected readonly dataSource: DataSource,
    protected readonly usersRepository: UsersRepository,
    protected readonly mailAdapter: MailAdapter,
  ) {
    super(dataSource);
  }

  async doLogic(
    command: RegistrationCommand,
    manager: EntityManager,
  ): Promise<number | null> {
    // Create user
    const user = new User();
    user.login = command.userInputDto.login;
    user.passwordHash = await bcrypt.hash(
      command.userInputDto.password,
      Number(process.env.HASH_ROUNDS),
    );
    user.email = command.userInputDto.email;
    user.isConfirmed = false;
    const savedUser = await this.usersRepository.queryRunnerSave(user, manager);

    // Create user ban record
    const userBanBySA = new UserBanBySA();
    userBanBySA.user = user;
    userBanBySA.isBanned = false;
    await this.usersRepository.queryRunnerSave(userBanBySA, manager);

    // Create user ban by blogger record
    const userBanByBlogger = new UserBanByBlogger();
    userBanByBlogger.user = user;
    userBanByBlogger.isBanned = false;

    await this.usersRepository.queryRunnerSave(userBanByBlogger, manager);

    // Create user email confirmation record
    const confirmationCode = randomUUID();
    const userEmailConfirmation = new UserEmailConfirmation();
    userEmailConfirmation.user = user;
    userEmailConfirmation.confirmationCode = confirmationCode;
    userEmailConfirmation.expirationDate = add(new Date(), { hours: 1 });

    await this.usersRepository.queryRunnerSave(userEmailConfirmation, manager);

    await this.sendRegistrationMail(
      user.login,
      user.email,
      confirmationCode,
      user.id,
    );

    // Return user id
    return savedUser.id;
  }

  public async execute(command: RegistrationCommand) {
    return super.execute(command);
  }

  private async sendRegistrationMail(
    login: string,
    email: string,
    confirmationCode: string,
    userId: number,
  ): Promise<any> {
    try {
      await this.mailAdapter.sendRegistrationMail(
        login,
        email,
        confirmationCode,
      );
    } catch (e) {
      console.error(e);
      await this.usersRepository.deleteUser(userId);
      return null;
    }
  }
}
