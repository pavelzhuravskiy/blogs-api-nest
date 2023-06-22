import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import bcrypt from 'bcrypt';
import { UserInputDto } from '../../../../dto/users/input/user-input.dto';
import { UsersRepository } from '../../../../infrastructure/repositories/users/users.repository';
import { User } from '../../../../entities/users/user.entity';
import { UserBanBySA } from '../../../../entities/users/user-ban-by-sa.entity';
import { DataSource } from 'typeorm';

export class UserCreateCommand {
  constructor(public userInputDto: UserInputDto) {}
}

@CommandHandler(UserCreateCommand)
export class UserCreateUseCase implements ICommandHandler<UserCreateCommand> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private dataSource: DataSource,
  ) {}

  async execute(command: UserCreateCommand): Promise<number | null> {
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
      user.isConfirmed = true;
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

      // Commit transaction
      await queryRunner.commitTransaction();

      // Return user id
      return savedUser.id;
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
