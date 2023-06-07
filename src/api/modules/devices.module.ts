import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Device, DeviceSchema } from '../entities/_mongoose/device.entity';
import { JwtService } from '@nestjs/jwt';
import { DevicesMongooseRepository } from '../infrastructure/devices/mongoose/devices.repository';
import { PublicDevicesController } from '../_public/devices/public.devices.controller';
import { DevicesMongooseQueryRepository } from '../infrastructure/devices/mongoose/devices.query.repository';
import { DeviceDeleteForTerminateUseCase } from '../_public/devices/application/use-cases/device-delete-for-terminate.use-case';
import { DevicesDeleteOldUseCase } from '../_public/devices/application/use-cases/devices-delete-old.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { DevicesDeleteForUserBanUseCase } from '../_public/devices/application/use-cases/devices-delete-for-user-ban.use-case';

const useCases = [
  DeviceDeleteForTerminateUseCase,
  DevicesDeleteOldUseCase,
  DevicesDeleteForUserBanUseCase,
];
const repositories = [
  DevicesMongooseRepository,
  DevicesMongooseQueryRepository,
];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]),
    CqrsModule,
  ],
  controllers: [PublicDevicesController],
  providers: [JwtService, ...useCases, ...repositories],
})
export class DevicesModule {}
