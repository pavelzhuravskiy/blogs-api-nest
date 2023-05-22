import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Device,
  DeviceDocument,
  DeviceModelType,
} from '../../../../api/public/devices/device.entity';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { DevicesRepository } from '../../../../api/public/devices/infrastructure/devices.repository';

export class DeviceCreateForLoginCommand {
  constructor(
    public token: string,
    public ip: string,
    public userAgent: string,
  ) {}
}

@CommandHandler(DeviceCreateForLoginCommand)
export class DeviceCreateForLoginUseCase
  implements ICommandHandler<DeviceCreateForLoginCommand>
{
  constructor(
    @InjectModel(Device.name)
    private DeviceModel: DeviceModelType,
    private readonly devicesRepository: DevicesRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    command: DeviceCreateForLoginCommand,
  ): Promise<DeviceDocument | null> {
    const decodedToken = await this.jwtService.decode(command.token);

    const device = this.DeviceModel.createDevice(
      this.DeviceModel,
      decodedToken,
      command.ip,
      command.userAgent,
    );

    return this.devicesRepository.save(device);
  }
}
