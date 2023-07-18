import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Device } from '../../../entities/devices/device.entity';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectRepository(Device)
    private readonly devicesRepository: Repository<Device>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}
  // ***** Find device operations *****
  async findDevice(deviceId: string): Promise<Device | null> {
    try {
      return await this.devicesRepository
        .createQueryBuilder('d')
        .leftJoinAndSelect('d.user', 'u')
        .where(`d.deviceId = :deviceId`, { deviceId: deviceId })
        .getOne();
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  // ***** Delete device operations *****
  async deleteDevice(deviceId: string): Promise<boolean> {
    const result = await this.devicesRepository
      .createQueryBuilder('d')
      .delete()
      .from(Device)
      .where('deviceId = :deviceId', { deviceId: deviceId })
      .execute();
    return result.affected === 1;
  }

  async deleteOldDevices(deviceId: string, userId: string): Promise<boolean> {
    const result = await this.devicesRepository
      .createQueryBuilder('d')
      .delete()
      .from(Device)
      .where('userId = :userId', { userId: userId })
      .andWhere('deviceId != :deviceId', { deviceId: deviceId })
      .execute();
    return result.affected === 1;
  }
}
