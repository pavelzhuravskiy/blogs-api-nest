import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceDocument } from '../../../../entities/_mongoose/device.entity';
import { DevicesRepository } from '../../../../infrastructure/devices/devices.repository';

export class DeviceUpdateForTokensCommand {
  constructor(public token: any, public ip: string, public userAgent: string) {}
}

@CommandHandler(DeviceUpdateForTokensCommand)
export class DeviceUpdateForTokensUseCase
  implements ICommandHandler<DeviceUpdateForTokensCommand>
{
  constructor(private readonly devicesRepository: DevicesRepository) {}

  async execute(
    command: DeviceUpdateForTokensCommand,
  ): Promise<DeviceDocument | null> {
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
