import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

export type DeviceDocument = HydratedDocument<Device>;

export type DeviceModelStaticType = {
  createDevice: (
    DeviceModel: DeviceModelType,
    token: any,
    ip: string,
    userAgent: string,
  ) => DeviceDocument;
};

export type DeviceModelType = Model<Device> & DeviceModelStaticType;

@Schema()
export class Device {
  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  deviceId: string;

  @Prop({ required: true })
  lastActiveDate: number;

  @Prop({ required: true })
  expirationDate: number;

  updateDevice(decodedToken: any, ip: string, userAgent: string) {
    this.lastActiveDate = decodedToken.iat;
    this.ip = ip;
    this.title = userAgent;
  }

  static createDevice(
    DeviceModel: DeviceModelType,
    token: any,
    ip: string,
    userAgent: string,
  ): DeviceDocument {
    const device = {
      ip: ip,
      title: userAgent,
      userId: token.sub,
      deviceId: token.deviceId,
      lastActiveDate: token.iat,
      expirationDate: token.exp,
    };
    return new DeviceModel(device);
  }
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

DeviceSchema.methods = {
  updateDevice: Device.prototype.updateDevice,
};

const deviceStaticMethods: DeviceModelStaticType = {
  createDevice: Device.createDevice,
};

DeviceSchema.statics = deviceStaticMethods;
