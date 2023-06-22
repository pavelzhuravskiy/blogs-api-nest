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
    return this.devicesRepository
      .createQueryBuilder('d')
      .where(`d.deviceId = :deviceId`, { deviceId: deviceId })
      .getOne();
  }

  async deleteOldDevices(deviceId: string): Promise<boolean> {
    return this.dataSource.query(
      `delete
       from public.devices
       where "deviceId" != $1;`,
      [deviceId],
    );
  }

  async deleteDevice(deviceId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `delete
       from public.devices
       where "deviceId" = $1;`,
      [deviceId],
    );
    return result[1] === 1;
  }

  async deleteBannedUserDevices(userId: number): Promise<boolean> {
    return this.dataSource.query(
      `delete
       from public.devices
       where "userId" = $1;`,
      [userId],
    );
  }
}
