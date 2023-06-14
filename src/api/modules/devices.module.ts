import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PublicDevicesController } from '../_public/devices/public.devices.controller';
import { DeviceDeleteForTerminateUseCase } from '../_public/devices/application/use-cases/device-delete-for-terminate.use-case';
import { DevicesDeleteOldUseCase } from '../_public/devices/application/use-cases/devices-delete-old.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { DevicesRepository } from '../infrastructure/devices/devices.repository';
import { DevicesQueryRepository } from '../infrastructure/devices/devices.query.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from '../entities/devices/device.entity';

const useCases = [DeviceDeleteForTerminateUseCase, DevicesDeleteOldUseCase];
const entities = [Device];
const repositories = [DevicesRepository, DevicesQueryRepository];

@Module({
  imports: [TypeOrmModule.forFeature([...entities]), CqrsModule],
  controllers: [PublicDevicesController],
  providers: [JwtService, ...useCases, ...repositories],
})
export class DevicesModule {}
