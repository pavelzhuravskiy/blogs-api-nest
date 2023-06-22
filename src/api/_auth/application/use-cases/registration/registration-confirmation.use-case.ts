import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfirmCodeInputDto } from '../../../dto/confirm-code.input.dto';
import { UsersRepository } from '../../../../infrastructure/repositories/users/users.repository';
import { DataSource } from 'typeorm';

export class RegistrationConfirmationCommand {
  constructor(public confirmCodeInputDto: ConfirmCodeInputDto) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase
  implements ICommandHandler<RegistrationConfirmationCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private dataSource: DataSource,
  ) {}

  async execute(
    command: RegistrationConfirmationCommand,
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

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const queryRunnerManager = queryRunner.manager;

    try {
      // Confirm user
      user.isConfirmed = true;
      await this.usersRepository.queryRunnerSave(user, queryRunnerManager);
      await this.usersRepository.deleteEmailConfirmationRecord(user.id);

      // Commit transaction
      await queryRunner.commitTransaction();
      return true;
    } catch (e) {
      // since we have errors - rollback the changes
      console.error(e);
      await queryRunner.rollbackTransaction();
      return null;
    } finally {
      // release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }
}
