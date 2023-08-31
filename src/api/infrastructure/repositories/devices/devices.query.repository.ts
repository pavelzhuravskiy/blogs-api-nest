import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceViewDto } from '../../../dto/devices/view/device.view.dto';
import { Device } from '../../../entities/devices/device.entity';

@Injectable()
export class DevicesQueryRepository {
  constructor(
    @InjectRepository(Device)
    private readonly devicesRepository: Repository<Device>,
  ) {}

  async findDevices(userId: string): Promise<DeviceViewDto[]> {
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
