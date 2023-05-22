import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../../infrastructure/devices.repository';

export class DevicesDeleteOldCommand {
  constructor(public deviceId: string) {}
}

@CommandHandler(DevicesDeleteOldCommand)
export class DevicesDeleteOldUseCase
  implements ICommandHandler<DevicesDeleteOldCommand>
{
  constructor(private readonly devicesRepository: DevicesRepository) {}

  async execute(command: DevicesDeleteOldCommand): Promise<boolean> {
    return this.devicesRepository.deleteOldDevices(command.deviceId);
  }
}
