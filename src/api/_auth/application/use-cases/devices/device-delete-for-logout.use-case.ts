import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../../../../infrastructure/repositories/devices/devices.repository';

export class DeviceDeleteForLogoutCommand {
  constructor(public deviceId: string) {}
}

@CommandHandler(DeviceDeleteForLogoutCommand)
export class DeviceDeleteForLogoutUseCase
  implements ICommandHandler<DeviceDeleteForLogoutCommand>
{
  constructor(private readonly devicesRepository: DevicesRepository) {}

  async execute(command: DeviceDeleteForLogoutCommand): Promise<boolean> {
    return this.devicesRepository.deleteDevice(command.deviceId);
  }
}
