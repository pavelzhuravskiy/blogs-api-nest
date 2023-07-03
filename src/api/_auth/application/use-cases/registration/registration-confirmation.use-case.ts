import { CommandHandler } from '@nestjs/cqrs';
import { ConfirmCodeInputDto } from '../../../dto/confirm-code.input.dto';
import { UsersRepository } from '../../../../infrastructure/repositories/users/users.repository';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionBaseUseCase } from '../../../../_common/application/use-cases/transaction-base.use-case';

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
    protected readonly usersRepository: UsersRepository,
  ) {
    super(dataSource);
  }

  async doLogic(
    command: RegistrationConfirmationCommand,
    manager: EntityManager,
  ): Promise<boolean | null> {
    const user = await this.usersRepository.findUserForEmailConfirm(
      command.confirmCodeInputDto.code,
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
    await this.usersRepository.queryRunnerSave(user, manager);
    return this.usersRepository.deleteEmailConfirmationRecord(user.id);
  }
}
