import { CommandHandler } from '@nestjs/cqrs';
import { NewPasswordInputDto } from '../../../dto/new-password.input.dto';
import bcrypt from 'bcrypt';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionBaseUseCase } from '../../../../_common/application/use-cases/transaction-base.use-case';
import { UsersTransactionsRepository } from '../../../../infrastructure/repositories/users/users.transactions.repository';
import { TransactionsRepository } from '../../../../infrastructure/repositories/common/transactions.repository';

export class PasswordUpdateCommand {
  constructor(public newPasswordDto: NewPasswordInputDto) {}
}

@CommandHandler(PasswordUpdateCommand)
export class PasswordUpdateUseCase extends TransactionBaseUseCase<
  PasswordUpdateCommand,
  boolean
> {
  constructor(
    protected readonly dataSource: DataSource,
    protected readonly transactionsRepository: TransactionsRepository,
    protected readonly usersTransactionsRepository: UsersTransactionsRepository,
  ) {
    super(dataSource);
  }

  async doLogic(
    command: PasswordUpdateCommand,
    manager: EntityManager,
  ): Promise<boolean | null> {
    const user =
      await this.usersTransactionsRepository.findUserForPasswordUpdate(
        command.newPasswordDto.recoveryCode,
        manager,
      );

    if (!user || user.userPasswordRecovery.expirationDate < new Date()) {
      return null;
    }

    // Confirm user
    user.passwordHash = await bcrypt.hash(
      command.newPasswordDto.newPassword,
      Number(process.env.HASH_ROUNDS),
    );
    await this.transactionsRepository.save(user, manager);
    return this.usersTransactionsRepository.deletePasswordRecoveryRecord(
      user.id,
      manager,
    );
  }

  public async execute(command: PasswordUpdateCommand) {
    return super.execute(command);
  }
}
