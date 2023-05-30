import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Device,
  DeviceDocument,
  DeviceModelType,
} from '../../entities/device.entity';

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

  async deleteOldDevices(currentDevice: string): Promise<boolean> {
    await this.DeviceModel.deleteMany({ deviceId: { $ne: currentDevice } });
    return (await this.DeviceModel.countDocuments()) === 1;
  }

  async deleteAllUserDevices(userId: string): Promise<boolean> {
    await this.DeviceModel.deleteMany({ userId: userId });
    return (await this.DeviceModel.countDocuments({ userId: userId })) === 0;
  }
}
