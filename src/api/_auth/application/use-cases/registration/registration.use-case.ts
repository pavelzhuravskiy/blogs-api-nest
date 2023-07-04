import { CommandHandler } from '@nestjs/cqrs';
import { UserInputDto } from '../../../../dto/users/input/user-input.dto';
import { UsersRepository } from '../../../../infrastructure/repositories/users/users.repository';
import { MailAdapter } from '../../../../infrastructure/mail/mail-adapter';
import { DataSource, EntityManager } from 'typeorm';
import { UserEmailConfirmation } from '../../../../entities/users/user-email-confirmation.entity';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { TransactionBaseUseCase } from '../../../../_common/application/use-cases/transaction-base.use-case';
import { UsersService } from '../../../../_superadmin/users/application/users.service';

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
    protected readonly usersService: UsersService,
    protected readonly usersRepository: UsersRepository,
    protected readonly mailAdapter: MailAdapter,
  ) {
    super(dataSource);
  }

  async doLogic(
    command: RegistrationCommand,
    manager: EntityManager,
  ): Promise<number | null> {
    const { user, userBanBySA, userBanByBlogger } =
      await this.usersService.createUser(command);
    user.isConfirmed = false;

    const savedUser = await this.usersRepository.queryRunnerSave(user, manager);
    await this.usersRepository.queryRunnerSave(userBanBySA, manager);
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
