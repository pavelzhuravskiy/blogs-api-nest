import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Device, DeviceSchema } from './schemas/device.entity';
import { JwtService } from '@nestjs/jwt';
import { DevicesService } from './devices.service';
import { DevicesRepository } from './devices.repository';
import { DevicesController } from './devices.controller';
import { DevicesQueryRepository } from './devices.query.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]),
  ],
  providers: [
    DevicesService,
    DevicesRepository,
    DevicesQueryRepository,
    JwtService,
  ],
  controllers: [DevicesController],
  exports: [DevicesService, DevicesRepository],
})
export class DevicesModule {}
