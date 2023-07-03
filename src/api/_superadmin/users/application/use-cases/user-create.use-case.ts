import { CommandHandler } from '@nestjs/cqrs';
import bcrypt from 'bcrypt';
import { UserInputDto } from '../../../../dto/users/input/user-input.dto';
import { UsersRepository } from '../../../../infrastructure/repositories/users/users.repository';
import { User } from '../../../../entities/users/user.entity';
import { UserBanBySA } from '../../../../entities/users/user-ban-by-sa.entity';
import { DataSource, EntityManager } from 'typeorm';
import { UserBanByBlogger } from '../../../../entities/users/user-ban-by-blogger.entity';
import { TransactionBaseUseCase } from '../../../../_common/application/use-cases/transaction-base.use-case';
import { InjectDataSource } from '@nestjs/typeorm';

export class UserCreateCommand {
  constructor(public userInputDto: UserInputDto) {}
}

@CommandHandler(UserCreateCommand)
export class UserCreateUseCase extends TransactionBaseUseCase<
  UserCreateCommand,
  number
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    protected readonly usersRepository: UsersRepository,
  ) {
    super(dataSource);
  }

  async doLogic(
    command: UserCreateCommand,
    manager: EntityManager,
  ): Promise<number> {
    // Create user
    const user = new User();
    user.login = command.userInputDto.login;
    user.passwordHash = await bcrypt.hash(
      command.userInputDto.password,
      Number(process.env.HASH_ROUNDS),
    );
    user.email = command.userInputDto.email;
    user.isConfirmed = true;

    const savedUser = await this.usersRepository.queryRunnerSave(user, manager);

    // Create user ban by SA record
    const userBanBySA = new UserBanBySA();
    userBanBySA.user = user;
    userBanBySA.isBanned = false;

    await this.usersRepository.queryRunnerSave(userBanBySA, manager);

    // Create user ban by blogger record
    const userBanByBlogger = new UserBanByBlogger();
    userBanByBlogger.user = user;
    userBanByBlogger.isBanned = false;

    await this.usersRepository.queryRunnerSave(userBanByBlogger, manager);

    return savedUser.id;
  }

  public async execute(command: UserCreateCommand) {
    return super.execute(command);
  }
}
