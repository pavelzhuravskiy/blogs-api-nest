import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { Device } from '../../../../entities/devices/device.entity';
import { DataSourceRepository } from '../../../../infrastructure/repositories/common/data-source.repository';

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
    private readonly dataSourceRepository: DataSourceRepository,

    private readonly jwtService: JwtService,
  ) {}

  async execute(command: DeviceCreateForLoginCommand): Promise<Device> {
    const decodedToken: any = this.jwtService.decode(command.token);

    const device = new Device();
    device.deviceId = decodedToken.deviceId;
    device.ip = command.ip;
    device.title = command.userAgent;
    device.lastActiveDate = decodedToken.iat;
    device.expirationDate = decodedToken.exp;
    device.user = decodedToken.sub;

    await this.dataSourceRepository.save(device);
    return device;
  }
}
