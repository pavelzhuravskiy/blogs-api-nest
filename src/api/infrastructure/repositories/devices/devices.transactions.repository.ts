import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Device } from '../../../entities/devices/device.entity';

@Injectable()
export class DevicesTransactionsRepository {
  async deleteBannedUserDevices(
    userId: number,
    manager: EntityManager,
  ): Promise<boolean> {
    const result = await manager
      .createQueryBuilder(Device, 'd')
      .delete()
      .from(Device)
      .where('userId = :userId', { userId: userId })
      .execute();
    return result.affected === 1;
  }
}
