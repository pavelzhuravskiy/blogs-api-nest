import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../../infrastructure/devices.repository';

export class DevicesDeleteForUserBanCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DevicesDeleteForUserBanCommand)
export class DevicesDeleteForUserBanUseCase
  implements ICommandHandler<DevicesDeleteForUserBanCommand>
{
  constructor(private readonly devicesRepository: DevicesRepository) {}

  async execute(command: DevicesDeleteForUserBanCommand): Promise<boolean> {
    return this.devicesRepository.deleteAllUserDevices(command.userId);
  }
}
