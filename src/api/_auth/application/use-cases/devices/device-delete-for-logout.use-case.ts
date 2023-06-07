import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesMongooseRepository } from '../../../../infrastructure/devices/mongoose/devices.repository';

export class DeviceDeleteForLogoutCommand {
  constructor(public deviceId: string) {}
}

@CommandHandler(DeviceDeleteForLogoutCommand)
export class DeviceDeleteForLogoutUseCase
  implements ICommandHandler<DeviceDeleteForLogoutCommand>
{
  constructor(private readonly devicesRepository: DevicesMongooseRepository) {}

  async execute(command: DeviceDeleteForLogoutCommand): Promise<boolean> {
    return this.devicesRepository.deleteDevice(command.deviceId);
  }
}
