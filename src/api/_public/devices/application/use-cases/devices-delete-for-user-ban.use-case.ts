import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesMongooseRepository } from '../../../../infrastructure/devices/mongoose/devices.repository';

export class DevicesDeleteForUserBanCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DevicesDeleteForUserBanCommand)
export class DevicesDeleteForUserBanUseCase
  implements ICommandHandler<DevicesDeleteForUserBanCommand>
{
  constructor(private readonly devicesRepository: DevicesMongooseRepository) {}

  async execute(command: DevicesDeleteForUserBanCommand): Promise<boolean> {
    return this.devicesRepository.deleteAllUserDevices(command.userId);
  }
}
