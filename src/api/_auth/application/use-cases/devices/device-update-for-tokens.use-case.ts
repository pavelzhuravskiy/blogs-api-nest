import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../../../../infrastructure/repositories/devices/devices.repository';
import { Device } from '../../../../entities/devices/device.entity';
import { DataSourceRepository } from '../../../../infrastructure/repositories/common/data-source.repository';

export class DeviceUpdateForTokensCommand {
  constructor(public token: any, public ip: string, public userAgent: string) {}
}

@CommandHandler(DeviceUpdateForTokensCommand)
export class DeviceUpdateForTokensUseCase
  implements ICommandHandler<DeviceUpdateForTokensCommand>
{
  constructor(
    private readonly devicesRepository: DevicesRepository,
    private readonly dataSourceRepository: DataSourceRepository,
  ) {}

  async execute(command: DeviceUpdateForTokensCommand): Promise<Device | null> {
    const device = await this.devicesRepository.findDevice(
      command.token.deviceId,
    );

    if (!device) {
      return null;
    }

    device.lastActiveDate = command.token.iat;
    device.ip = command.ip;
    device.title = command.userAgent;

    await this.dataSourceRepository.save(device);
    return device;
  }
}
