import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../../../../infrastructure/devices/devices.repository';

export class DeviceUpdateForTokensCommand {
  constructor(public token: any, public ip: string, public userAgent: string) {}
}

@CommandHandler(DeviceUpdateForTokensCommand)
export class DeviceUpdateForTokensUseCase
  implements ICommandHandler<DeviceUpdateForTokensCommand>
{
  constructor(private readonly devicesRepository: DevicesRepository) {}

  async execute(command: DeviceUpdateForTokensCommand): Promise<boolean> {
    const device = await this.devicesRepository.findDevice(
      command.token.deviceId,
    );

    if (!device) {
      return null;
    }

    return this.devicesRepository.updateDevice(
      device.deviceId,
      command.token,
      command.ip,
      command.userAgent,
    );
  }
}
