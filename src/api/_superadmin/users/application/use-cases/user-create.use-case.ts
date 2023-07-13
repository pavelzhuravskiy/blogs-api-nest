import { CommandHandler } from '@nestjs/cqrs';
import { UserInputDto } from '../../../../dto/users/input/user-input.dto';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionBaseUseCase } from '../../../../_common/application/use-cases/transaction-base.use-case';
import { InjectDataSource } from '@nestjs/typeorm';
import { UsersService } from '../users.service';
import { TransactionsRepository } from '../../../../infrastructure/repositories/common/transactions.repository';

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
    protected readonly usersService: UsersService,
    protected readonly transactionsRepository: TransactionsRepository,
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

    const savedUser = await this.transactionsRepository.save(user, manager);
    await this.transactionsRepository.save(userBanBySA, manager);
    await this.transactionsRepository.save(userBanByBlogger, manager);

    return savedUser.id;
  }

  public async execute(command: UserCreateCommand) {
    return super.execute(command);
  }
}
