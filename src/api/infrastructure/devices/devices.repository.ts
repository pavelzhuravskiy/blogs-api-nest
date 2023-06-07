import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Device } from '../../entities/devices/device.entity';
import { uuidIsValid } from '../../../helpers/uuid-is-valid';

@Injectable()
export class DevicesRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async createDevice(
    decodedToken: any,
    ip: string,
    userAgent: string,
  ): Promise<number> {
    const device = await this.dataSource.query(
      `insert into public.devices ("userId", "deviceId", ip, title, "lastActiveDate",
                            "expirationDate")
         values ($1, $2, $3, $4, $5, $6)
         returning id;`,
      [
        decodedToken.sub,
        decodedToken.deviceId,
        ip,
        userAgent,
        decodedToken.iat,
        decodedToken.exp,
      ],
    );
    return device[0].id;
  }

  async findDevice(deviceId: string): Promise<Device | null> {
    if (!uuidIsValid(deviceId)) {
      return null;
    }

    const devices = await this.dataSource.query(
      `select id, "userId", "deviceId", "lastActiveDate"
       from public.devices
       where "deviceId" = $1`,
      [deviceId],
    );

    if (devices.length === 0) {
      return null;
    }

    return devices[0];
  }

  async updateDevice(
    deviceId: string,
    token: any,
    ip: string,
    userAgent: string,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `update public.devices
       set "lastActiveDate" = $2,
           ip = $3,
           title = $4
       where "deviceId" = $1`,
      [deviceId, token.iat, ip, userAgent],
    );
    return result[1] === 1;
  }

  async deleteOldDevices(deviceId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `delete
       from public.devices
       where "deviceId" != $1;`,
      [deviceId],
    );
    return result[1] === 1;
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
}
