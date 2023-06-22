import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DeviceViewDto } from '../../../dto/devices/view/device.view.dto';
import { Device } from '../../../entities/devices/device.entity';

@Injectable()
export class DevicesQueryRepository {
  constructor(
    @InjectRepository(Device)
    private readonly devicesRepository: Repository<Device>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async findDevices(userId: number): Promise<DeviceViewDto[]> {
    const devices = await this.devicesRepository
      .createQueryBuilder('d')
      .where(`d.userId = :userId`, {
        userId: userId,
      })
      .getMany();

    return devices.map((d) => {
      return {
        ip: d.ip,
        title: d.title,
        lastActiveDate: new Date(d.lastActiveDate * 1000).toISOString(),
        deviceId: d.deviceId,
      };
    });
  }
}
