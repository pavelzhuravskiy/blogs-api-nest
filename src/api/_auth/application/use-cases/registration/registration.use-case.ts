import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserInputDto } from '../../../../dto/users/input/user-input.dto';
import bcrypt from 'bcrypt';
import { UsersRepository } from '../../../../infrastructure/repositories/users/users.repository';
import { MailAdapter } from '../../../../infrastructure/mail/mail-adapter';
import { User } from '../../../../entities/users/user.entity';
import { UserBanBySA } from '../../../../entities/users/user-ban-by-sa.entity';
import { DataSource } from 'typeorm';
import { UserEmailConfirmation } from '../../../../entities/users/user-email-confirmation.entity';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';

export class RegistrationCommand {
  constructor(public userInputDto: UserInputDto) {}
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase
  implements ICommandHandler<RegistrationCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly emailAdapter: MailAdapter,
    private dataSource: DataSource,
  ) {}

  async execute(command: RegistrationCommand): Promise<number | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const queryRunnerManager = queryRunner.manager;

    try {
      // Create user
      const user = new User();
      user.login = command.userInputDto.login;
      user.passwordHash = await bcrypt.hash(
        command.userInputDto.password,
        Number(process.env.HASH_ROUNDS),
      );
      user.email = command.userInputDto.email;
      user.isConfirmed = false;
      const savedUser = await this.usersRepository.queryRunnerSave(
        user,
        queryRunnerManager,
      );

      // Create user ban record
      const userBanBySA = new UserBanBySA();
      userBanBySA.user = user;
      userBanBySA.isBanned = false;
      await this.usersRepository.queryRunnerSave(
        userBanBySA,
        queryRunnerManager,
      );

      // Create user email confirmation record
      const confirmationCode = randomUUID();
      const userEmailConfirmation = new UserEmailConfirmation();
      userEmailConfirmation.user = user;
      userEmailConfirmation.confirmationCode = confirmationCode;
      userEmailConfirmation.expirationDate = add(new Date(), { hours: 1 });

      await this.usersRepository.queryRunnerSave(
        userEmailConfirmation,
        queryRunnerManager,
      );

      await this.sendRegistrationMail(command, confirmationCode, savedUser.id);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Return user id
      return savedUser.id;
    } catch (e) {
      // Since we have errors - rollback the changes
      console.error(e);
      await queryRunner.rollbackTransaction();
    } finally {
      // Release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }

  private async sendRegistrationMail(
    command: RegistrationCommand,
    confirmationCode: string,
    userId: number,
  ): Promise<any> {
    try {
      await this.emailAdapter.sendRegistrationMail(
        command.userInputDto.login,
        command.userInputDto.email,
        confirmationCode,
      );
    } catch (e) {
      console.error(e);
      await this.usersRepository.deleteUser(userId);
      return null;
    }
  }
}
