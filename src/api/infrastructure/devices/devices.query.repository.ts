import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DeviceViewDto } from '../../dto/devices/view/device.view.dto';

@Injectable()
export class DevicesQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findDevices(userId: string): Promise<DeviceViewDto[]> {
    const devices = await this.dataSource.query(
      `select ip, title, "lastActiveDate", "deviceId"
              from public.devices
              where "userId" = $1;
      `,
      [userId],
    );
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
