import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NewPasswordInputDto } from '../../../dto/new-password.input.dto';
import bcrypt from 'bcrypt';
import { UsersRepository } from '../../../../infrastructure/repositories/users/users.repository';
import { DataSource } from 'typeorm';

export class PasswordUpdateCommand {
  constructor(public newPasswordDto: NewPasswordInputDto) {}
}

@CommandHandler(PasswordUpdateCommand)
export class PasswordUpdateUseCase
  implements ICommandHandler<PasswordUpdateCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private dataSource: DataSource,
  ) {}

  async execute(command: PasswordUpdateCommand): Promise<boolean | null> {
    const user = await this.usersRepository.findUserForPasswordUpdate(
      command.newPasswordDto.recoveryCode,
    );

    if (!user || user.userPasswordRecovery.expirationDate < new Date()) {
      return null;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const queryRunnerManager = queryRunner.manager;

    try {
      // Confirm user
      user.passwordHash = await bcrypt.hash(
        command.newPasswordDto.newPassword,
        Number(process.env.HASH_ROUNDS),
      );
      await this.usersRepository.queryRunnerSave(user, queryRunnerManager);
      await this.usersRepository.deletePasswordRecoveryRecord(user.id);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Return user id
      return true;
    } catch (e) {
      // since we have errors - rollback the changes
      console.error(e);
      await queryRunner.rollbackTransaction();
    } finally {
      // release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }
}
