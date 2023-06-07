import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Device, DeviceSchema } from '../entities/_mongoose/device.entity';
import { JwtService } from '@nestjs/jwt';
import { DevicesMongooseRepository } from '../infrastructure/devices/mongoose/devices.repository';
import { PublicDevicesController } from '../_public/devices/public.devices.controller';
import { DeviceDeleteForTerminateUseCase } from '../_public/devices/application/use-cases/device-delete-for-terminate.use-case';
import { DevicesDeleteOldUseCase } from '../_public/devices/application/use-cases/devices-delete-old.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { DevicesDeleteForUserBanUseCase } from '../_public/devices/application/use-cases/devices-delete-for-user-ban.use-case';
import { DevicesRepository } from '../infrastructure/devices/devices.repository';
import { DevicesQueryRepository } from '../infrastructure/devices/devices.query.repository';

const useCases = [
  DeviceDeleteForTerminateUseCase,
  DevicesDeleteOldUseCase,
  DevicesDeleteForUserBanUseCase,
];
const mongooseRepositories = [DevicesMongooseRepository];

const repositories = [DevicesRepository, DevicesQueryRepository];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]),
    CqrsModule,
  ],
  controllers: [PublicDevicesController],
  providers: [
    JwtService,
    ...useCases,
    ...repositories,
    ...mongooseRepositories,
  ],
})
export class DevicesModule {}
