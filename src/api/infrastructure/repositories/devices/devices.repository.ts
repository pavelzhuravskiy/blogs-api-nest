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
  // ***** TypeORM data source manager SAVE *****
  async dataSourceSave(entity: Device): Promise<Device> {
    return this.dataSource.manager.save(entity);
  }

  // ***** Find device operations *****
  async findDevice(deviceId: string): Promise<Device | null> {
    try {
      return await this.devicesRepository
        .createQueryBuilder('d')
        .where(`d.deviceId = :deviceId`, { deviceId: deviceId })
        .leftJoinAndSelect('d.user', 'u')
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

  async deleteOldDevices(deviceId: string, userId: number): Promise<boolean> {
    const result = await this.devicesRepository
      .createQueryBuilder('d')
      .delete()
      .from(Device)
      .where('userId = :userId', { userId: userId })
      .andWhere('deviceId != :deviceId', { deviceId: deviceId })
      .execute();
    return result.affected === 1;
  }

  async deleteBannedUserDevices(userId: number): Promise<boolean> {
    const result = await this.devicesRepository
      .createQueryBuilder('d')
      .delete()
      .from(Device)
      .where('userId = :userId', { userId: userId })
      .execute();
    return result.affected === 1;
  }
}
