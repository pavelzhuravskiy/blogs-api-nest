import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Device,
  DeviceModelType,
} from '../../../entities/_mongoose/device.entity';

@Injectable()
export class DevicesMongooseRepository {
  constructor(
    @InjectModel(Device.name)
    private DeviceModel: DeviceModelType,
  ) {}

  async deleteAllUserDevices(userId: string): Promise<boolean> {
    await this.DeviceModel.deleteMany({ userId: userId });
    return (await this.DeviceModel.countDocuments({ userId: userId })) === 0;
  }
}
