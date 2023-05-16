import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Device,
  DeviceDocument,
  DeviceModelType,
} from '../../../../devices/schemas/device.entity';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { DevicesRepository } from '../../../../devices/infrastructure/devices.repository';

export class CreateDeviceCommand {
  constructor(
    public token: string,
    public ip: string,
    public userAgent: string,
  ) {}
}

@CommandHandler(CreateDeviceCommand)
export class CreateDeviceUseCase
  implements ICommandHandler<CreateDeviceCommand>
{
  constructor(
    @InjectModel(Device.name)
    private DeviceModel: DeviceModelType,
    private readonly jwtService: JwtService,
    private readonly devicesRepository: DevicesRepository,
  ) {}

  async execute(command: CreateDeviceCommand): Promise<DeviceDocument | null> {
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
