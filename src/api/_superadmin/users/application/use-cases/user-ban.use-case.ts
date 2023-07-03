import { CommandHandler } from '@nestjs/cqrs';
import { SAUserBanInputDto } from '../../../../dto/users/input/superadmin/sa.user-ban.input.dto';
import { UsersRepository } from '../../../../infrastructure/repositories/users/users.repository';
import { DevicesRepository } from '../../../../infrastructure/repositories/devices/devices.repository';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionBaseUseCase } from '../../../../_common/application/use-cases/transaction-base.use-case';

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
    protected readonly usersRepository: UsersRepository,
    protected readonly devicesRepository: DevicesRepository,
  ) {
    super(dataSource);
  }

  async doLogic(
    command: SAUserBanCommand,
    manager: EntityManager,
  ): Promise<boolean | null> {
    const user = await this.usersRepository.findUserForBanBySA(command.userId);

    if (!user) {
      return null;
    }

    if (command.saUserBanInputDto.isBanned) {
      // Ban user
      user.userBanBySA.isBanned = true;
      user.userBanBySA.banReason = command.saUserBanInputDto.banReason;
      user.userBanBySA.banDate = new Date();
      await this.usersRepository.queryRunnerSave(user.userBanBySA, manager);

      // Delete user's devices
      return this.devicesRepository.deleteBannedUserDevices(user.id);
    } else {
      user.userBanBySA.isBanned = false;
      user.userBanBySA.banReason = null;
      user.userBanBySA.banDate = null;
      await this.usersRepository.dataSourceSave(user.userBanBySA);
      return true;
    }
  }
}
