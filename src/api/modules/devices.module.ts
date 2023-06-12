import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DeviceMongooseEntity,
  DeviceSchema,
} from '../entities/_mongoose/device.entity';
import { JwtService } from '@nestjs/jwt';
import { PublicDevicesController } from '../_public/devices/public.devices.controller';
import { DeviceDeleteForTerminateUseCase } from '../_public/devices/application/use-cases/device-delete-for-terminate.use-case';
import { DevicesDeleteOldUseCase } from '../_public/devices/application/use-cases/devices-delete-old.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { DevicesRepository } from '../infrastructure/devices/devices.repository';
import { DevicesQueryRepository } from '../infrastructure/devices/devices.query.repository';

const useCases = [DeviceDeleteForTerminateUseCase, DevicesDeleteOldUseCase];
const repositories = [DevicesRepository, DevicesQueryRepository];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeviceMongooseEntity.name, schema: DeviceSchema },
    ]),
    CqrsModule,
  ],
  controllers: [PublicDevicesController],
  providers: [JwtService, ...useCases, ...repositories],
})
export class DevicesModule {}
