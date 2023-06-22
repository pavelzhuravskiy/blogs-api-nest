import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SAUserBanInputDto } from '../../../../dto/users/input/superadmin/sa.user-ban.input.dto';
import { UsersRepository } from '../../../../infrastructure/repositories/users/users.repository';
import { DevicesRepository } from '../../../../infrastructure/repositories/devices/devices.repository';
import { DataSource } from 'typeorm';

export class SAUserBanCommand {
  constructor(
    public saUserBanInputDto: SAUserBanInputDto,
    public userId: string,
  ) {}
}

@CommandHandler(SAUserBanCommand)
export class UserBanUseCase implements ICommandHandler<SAUserBanCommand> {
  constructor(
    private commandBus: CommandBus,
    private readonly usersRepository: UsersRepository,
    private readonly devicesRepository: DevicesRepository,
    private dataSource: DataSource,
  ) {}

  async execute(command: SAUserBanCommand): Promise<boolean | null> {
    const user = await this.usersRepository.findUserForBan(command.userId);

    if (!user) {
      return null;
    }

    if (command.saUserBanInputDto.isBanned) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const queryRunnerManager = queryRunner.manager;

      try {
        // Ban user
        user.userBanBySA.isBanned = true;
        user.userBanBySA.banReason = command.saUserBanInputDto.banReason;
        user.userBanBySA.banDate = new Date();
        await this.usersRepository.queryRunnerSave(
          user.userBanBySA,
          queryRunnerManager,
        );

        // Delete user's devices
        await this.devicesRepository.deleteBannedUserDevices(user.id);

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
    } else {
      user.userBanBySA.isBanned = false;
      user.userBanBySA.banReason = null;
      user.userBanBySA.banDate = null;
      await this.usersRepository.dataSourceSave(user.userBanBySA);
      return true;
    }
  }
}
