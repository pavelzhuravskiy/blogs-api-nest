import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { DevicesRepository } from '../../../../infrastructure/devices/devices.repository';

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
    private readonly devicesRepository: DevicesRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: DeviceCreateForLoginCommand): Promise<number> {
    const decodedToken = this.jwtService.decode(command.token);
    return this.devicesRepository.createDevice(
      decodedToken,
      command.ip,
      command.userAgent,
    );
  }
}
