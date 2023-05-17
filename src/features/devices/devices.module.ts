import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Device, DeviceSchema } from './device.entity';
import { JwtService } from '@nestjs/jwt';
import { DevicesRepository } from './infrastructure/devices.repository';
import { PublicDevicesController } from './api/public/public.devices.controller';
import { DevicesQueryRepository } from './infrastructure/devices.query.repository';
import { DeviceDeleteForTerminateUseCase } from './api/public/application/use-cases/device-delete-for-terminate.use-case';
import { DevicesDeleteOldUseCase } from './api/public/application/use-cases/devices-delete-old.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { DevicesDeleteForUserBanUseCase } from './api/public/application/use-cases/devices-delete-for-user-ban.use-case';

const useCases = [
  DeviceDeleteForTerminateUseCase,
  DevicesDeleteOldUseCase,
  DevicesDeleteForUserBanUseCase,
];
const repositories = [DevicesRepository, DevicesQueryRepository];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]),
    CqrsModule,
  ],
  controllers: [PublicDevicesController],
  providers: [JwtService, ...useCases, ...repositories],
})
export class DevicesModule {}
