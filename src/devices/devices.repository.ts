import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Device,
  DeviceDocument,
  DeviceModelType,
} from './schemas/device.entity';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectModel(Device.name)
    private DeviceModel: DeviceModelType,
  ) {}
  async save(device: DeviceDocument) {
    return device.save();
  }

  async findDevice(id: string): Promise<DeviceDocument | null> {
    const device = await this.DeviceModel.findOne({ deviceId: id });

    if (!device) {
      return null;
    }

    return device;
  }

  async deleteDevice(id: string): Promise<boolean> {
    const result = await this.DeviceModel.deleteOne({ deviceId: id });
    return result.deletedCount === 1;
  }

  async deleteDevices(): Promise<boolean> {
    await this.DeviceModel.deleteMany({});
    return (await this.DeviceModel.countDocuments()) === 0;
  }
}
