import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesMongooseRepository } from '../../../../infrastructure/devices/mongoose/devices.repository';

export class DevicesDeleteOldCommand {
  constructor(public deviceId: string) {}
}

@CommandHandler(DevicesDeleteOldCommand)
export class DevicesDeleteOldUseCase
  implements ICommandHandler<DevicesDeleteOldCommand>
{
  constructor(private readonly devicesRepository: DevicesMongooseRepository) {}

  async execute(command: DevicesDeleteOldCommand): Promise<boolean> {
    return this.devicesRepository.deleteOldDevices(command.deviceId);
  }
}
