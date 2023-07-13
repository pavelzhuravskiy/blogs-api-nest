import { CommandHandler } from '@nestjs/cqrs';
import { SAUserBanInputDto } from '../../../../dto/users/input/superadmin/sa.user-ban.input.dto';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionBaseUseCase } from '../../../../_common/application/use-cases/transaction-base.use-case';
import { UsersTransactionsRepository } from '../../../../infrastructure/repositories/users/users.transactions.repository';
import { TransactionsRepository } from '../../../../infrastructure/repositories/common/transactions.repository';
import { DevicesTransactionsRepository } from '../../../../infrastructure/repositories/devices/devices.transactions.repository';

export class SAUserBanCommand {
  constructor(
    public saUserBanInputDto: SAUserBanInputDto,
    public userId: string,
  ) {}
}

@CommandHandler(SAUserBanCommand)
export class UserBanUseCase extends TransactionBaseUseCase<
  SAUserBanCommand,
  boolean | null
> {
  constructor(
    protected readonly dataSource: DataSource,
    protected readonly transactionsRepository: TransactionsRepository,
    protected readonly usersTransactionsRepository: UsersTransactionsRepository,
    protected readonly devicesTransactionsRepository: DevicesTransactionsRepository,
  ) {
    super(dataSource);
  }

  async doLogic(
    command: SAUserBanCommand,
    manager: EntityManager,
  ): Promise<boolean | null> {
    const user = await this.usersTransactionsRepository.findUserForBanBySA(
      command.userId,
      manager,
    );

    if (!user) {
      return null;
    }

    if (command.saUserBanInputDto.isBanned) {
      // Ban user
      user.userBanBySA.isBanned = true;
      user.userBanBySA.banReason = command.saUserBanInputDto.banReason;
      user.userBanBySA.banDate = new Date();
      await this.transactionsRepository.save(user.userBanBySA, manager);

      // Delete user's devices
      return this.devicesTransactionsRepository.deleteBannedUserDevices(
        user.id,
        manager,
      );
    } else {
      user.userBanBySA.isBanned = false;
      user.userBanBySA.banReason = null;
      user.userBanBySA.banDate = null;
      await this.transactionsRepository.save(user.userBanBySA, manager);
      return true;
    }
  }

  public async execute(command: SAUserBanCommand) {
    return super.execute(command);
  }
}
