import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import {
  Device,
  DeviceDocument,
  DeviceModelType,
} from './schemas/device.entity';
import { DevicesRepository } from './devices.repository';

@Injectable()
export class DevicesService {
  constructor(
    @InjectModel(Device.name)
    private DeviceModel: DeviceModelType,
    private readonly jwtService: JwtService,
    private readonly devicesRepository: DevicesRepository,
  ) {}

  async createDevice(
    token: string,
    ip: string,
    userAgent: string,
  ): Promise<DeviceDocument | null> {
    const decodedToken = await this.jwtService.decode(token);

    const device = this.DeviceModel.createDevice(
      decodedToken,
      ip,
      userAgent,
      this.DeviceModel,
    );

    return this.devicesRepository.save(device);
  }

  async updateDevice(
    token: any,
    ip: string,
    userAgent: string,
  ): Promise<Device | null> {
    const device = await this.devicesRepository.findDevice(token.deviceId);

    if (!device) {
      return null;
    }

    await device.updateDevice(token, ip, userAgent);
    return this.devicesRepository.save(device);
  }

  async deleteDevices(): Promise<boolean> {
    return this.devicesRepository.deleteDevices();
  }
}
