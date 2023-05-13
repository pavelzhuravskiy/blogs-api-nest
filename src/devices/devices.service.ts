import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import {
  Device,
  DeviceDocument,
  DeviceModelType,
} from './schemas/device.entity';
import { DevicesRepository } from './devices.repository';
import { ResultCode } from '../exceptions/exception-codes.enum';
import {
  deviceIDField,
  deviceNotFound,
} from '../exceptions/exception.constants';
import { ExceptionResultType } from '../exceptions/types/exception-result.type';

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

  async logout(deviceId: string): Promise<boolean> {
    return this.devicesRepository.deleteDevice(deviceId);
  }

  async terminateSession(
    currentUserId: string,
    deviceId: string,
  ): Promise<ExceptionResultType<boolean>> {
    const device = await this.devicesRepository.findDevice(deviceId);

    if (!device) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: deviceIDField,
        message: deviceNotFound,
      };
    }

    if (device.userId !== currentUserId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    await this.devicesRepository.deleteDevice(deviceId);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }

  async deleteOldDevices(deviceId: string): Promise<boolean> {
    return this.devicesRepository.deleteOldDevices(deviceId);
  }
}
