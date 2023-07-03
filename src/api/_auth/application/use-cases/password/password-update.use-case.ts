import { CommandHandler } from '@nestjs/cqrs';
import { NewPasswordInputDto } from '../../../dto/new-password.input.dto';
import bcrypt from 'bcrypt';
import { UsersRepository } from '../../../../infrastructure/repositories/users/users.repository';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionBaseUseCase } from '../../../../_common/application/use-cases/transaction-base.use-case';

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
    protected readonly usersRepository: UsersRepository,
  ) {
    super(dataSource);
  }

  async doLogic(
    command: PasswordUpdateCommand,
    manager: EntityManager,
  ): Promise<boolean | null> {
    const user = await this.usersRepository.findUserForPasswordUpdate(
      command.newPasswordDto.recoveryCode,
    );

    if (!user || user.userPasswordRecovery.expirationDate < new Date()) {
      return null;
    }

    // Confirm user
    user.passwordHash = await bcrypt.hash(
      command.newPasswordDto.newPassword,
      Number(process.env.HASH_ROUNDS),
    );
    await this.usersRepository.queryRunnerSave(user, manager);
    return this.usersRepository.deletePasswordRecoveryRecord(user.id);
  }
}
