import { CommandHandler } from '@nestjs/cqrs';
import { UserInputDto } from '../../../../dto/users/input/user-input.dto';
import { UsersRepository } from '../../../../infrastructure/repositories/users/users.repository';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionBaseUseCase } from '../../../../_common/application/use-cases/transaction-base.use-case';
import { InjectDataSource } from '@nestjs/typeorm';
import { UsersService } from '../users.service';

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
    protected readonly usersService: UsersService,
  ) {
    super(dataSource);
  }

  async doLogic(
    command: UserCreateCommand,
    manager: EntityManager,
  ): Promise<number> {
    const { user, userBanBySA, userBanByBlogger } =
      await this.usersService.createUser(command);
    user.isConfirmed = true;

    const savedUser = await this.usersRepository.queryRunnerSave(user, manager);
    await this.usersRepository.queryRunnerSave(userBanBySA, manager);
    await this.usersRepository.queryRunnerSave(userBanByBlogger, manager);

    return savedUser.id;
  }

  public async execute(command: UserCreateCommand) {
    return super.execute(command);
  }
}
