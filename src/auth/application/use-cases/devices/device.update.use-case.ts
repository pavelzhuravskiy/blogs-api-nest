import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceDocument } from '../../../../devices/schemas/device.entity';
import { DevicesRepository } from '../../../../devices/infrastructure/devices.repository';

export class UpdateDeviceCommand {
  constructor(public token: any, public ip: string, public userAgent: string) {}
}

@CommandHandler(UpdateDeviceCommand)
export class UpdateDeviceUseCase
  implements ICommandHandler<UpdateDeviceCommand>
{
  constructor(private readonly devicesRepository: DevicesRepository) {}

  async execute(command: UpdateDeviceCommand): Promise<DeviceDocument | null> {
    const device = await this.devicesRepository.findDevice(
      command.token.deviceId,
    );

    if (!device) {
      return null;
    }

    await device.updateDevice(command.token, command.ip, command.userAgent);
    return this.devicesRepository.save(device);
  }
}
