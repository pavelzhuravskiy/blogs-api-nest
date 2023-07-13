import { CommandHandler } from '@nestjs/cqrs';
import { UserInputDto } from '../../../../dto/users/input/user-input.dto';
import { MailAdapter } from '../../../../infrastructure/mail/mail-adapter';
import { DataSource, EntityManager } from 'typeorm';
import { UserEmailConfirmation } from '../../../../entities/users/user-email-confirmation.entity';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { TransactionBaseUseCase } from '../../../../_common/application/use-cases/transaction-base.use-case';
import { UsersService } from '../../../../_superadmin/users/application/users.service';
import { TransactionsRepository } from '../../../../infrastructure/repositories/common/transactions.repository';
import { UsersTransactionsRepository } from '../../../../infrastructure/repositories/users/users.transactions.repository';

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
    protected readonly mailAdapter: MailAdapter,
    protected readonly transactionsRepository: TransactionsRepository,
    protected readonly usersTransactionsRepository: UsersTransactionsRepository,
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

    const savedUser = await this.transactionsRepository.save(user, manager);
    await this.transactionsRepository.save(userBanBySA, manager);
    await this.transactionsRepository.save(userBanByBlogger, manager);

    // Create user email confirmation record
    const confirmationCode = randomUUID();
    const userEmailConfirmation = new UserEmailConfirmation();
    userEmailConfirmation.user = user;
    userEmailConfirmation.confirmationCode = confirmationCode;
    userEmailConfirmation.expirationDate = add(new Date(), { hours: 1 });
    await this.transactionsRepository.save(userEmailConfirmation, manager);

    await this.sendRegistrationMail(
      user.login,
      user.email,
      confirmationCode,
      user.id,
      manager,
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
    manager: EntityManager,
  ): Promise<any> {
    try {
      await this.mailAdapter.sendRegistrationMail(
        login,
        email,
        confirmationCode,
      );
    } catch (e) {
      console.error(e);
      await this.usersTransactionsRepository.deleteUser(userId, manager);
      return null;
    }
  }
}
