import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../../../../devices/infrastructure/devices.repository';

export class DeleteDeviceCommand {
  constructor(public deviceId: string) {}
}

@CommandHandler(DeleteDeviceCommand)
export class DeleteDeviceUseCase
  implements ICommandHandler<DeleteDeviceCommand>
{
  constructor(private readonly devicesRepository: DevicesRepository) {}

  async execute(command: DeleteDeviceCommand): Promise<boolean> {
    return this.devicesRepository.deleteDevice(command.deviceId);
  }
}
