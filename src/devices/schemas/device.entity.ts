import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

export type DeviceDocument = HydratedDocument<Device>;

export type DeviceModelStaticType = {
  createDevice: (
    token: string | { [key: string]: any } | null,
    ip: string,
    userAgent: string,
    DeviceModel: DeviceModelType,
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

  static createDevice(
    token: any,
    ip: string,
    userAgent: string,
    DeviceModel: DeviceModelType,
  ): DeviceDocument {
    console.log(token);
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

const deviceStaticMethods: DeviceModelStaticType = {
  createDevice: Device.createDevice,
};

DeviceSchema.statics = deviceStaticMethods;
