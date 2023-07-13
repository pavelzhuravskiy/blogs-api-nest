import { CommandHandler } from '@nestjs/cqrs';
import { ConfirmCodeInputDto } from '../../../dto/confirm-code.input.dto';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionBaseUseCase } from '../../../../_common/application/use-cases/transaction-base.use-case';
import { UsersTransactionsRepository } from '../../../../infrastructure/repositories/users/users.transactions.repository';
import { TransactionsRepository } from '../../../../infrastructure/repositories/common/transactions.repository';

export class RegistrationConfirmationCommand {
  constructor(public confirmCodeInputDto: ConfirmCodeInputDto) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase extends TransactionBaseUseCase<
  RegistrationConfirmationCommand,
  boolean | null
> {
  constructor(
    protected readonly dataSource: DataSource,
    protected readonly transactionsRepository: TransactionsRepository,
    protected readonly usersTransactionsRepository: UsersTransactionsRepository,
  ) {
    super(dataSource);
  }

  async doLogic(
    command: RegistrationConfirmationCommand,
    manager: EntityManager,
  ): Promise<boolean | null> {
    const user = await this.usersTransactionsRepository.findUserForEmailConfirm(
      command.confirmCodeInputDto.code,
      manager,
    );

    if (
      !user ||
      user.isConfirmed ||
      user.userEmailConfirmation.expirationDate < new Date()
    ) {
      return null;
    }

    // Confirm user
    user.isConfirmed = true;
    await this.transactionsRepository.save(user, manager);
    return this.usersTransactionsRepository.deleteEmailConfirmationRecord(
      user.id,
      manager,
    );
  }

  public async execute(command: RegistrationConfirmationCommand) {
    return super.execute(command);
  }
}
