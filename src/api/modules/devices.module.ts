import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PublicDevicesController } from '../_public/devices/public.devices.controller';
import { DeviceDeleteForTerminateUseCase } from '../_public/devices/application/use-cases/device-delete-for-terminate.use-case';
import { DevicesDeleteOldUseCase } from '../_public/devices/application/use-cases/devices-delete-old.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { DevicesRepository } from '../infrastructure/repositories/devices/devices.repository';
import { DevicesQueryRepository } from '../infrastructure/repositories/devices/devices.query.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from '../entities/devices/device.entity';
import { DataSourceRepository } from '../infrastructure/repositories/common/data-source.repository';

const useCases = [DeviceDeleteForTerminateUseCase, DevicesDeleteOldUseCase];
const entities = [Device];
const repositories = [
  DevicesRepository,
  DevicesQueryRepository,
  DataSourceRepository,
];

@Module({
  imports: [TypeOrmModule.forFeature([...entities]), CqrsModule],
  controllers: [PublicDevicesController],
  providers: [JwtService, ...useCases, ...repositories],
  exports: [TypeOrmModule],
})
export class DevicesModule {}
