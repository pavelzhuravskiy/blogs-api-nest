import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtBearerStrategy } from './strategies/jwt-bearer.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { Device, DeviceSchema } from '../devices/schemas/device.entity';
import { JwtService } from '@nestjs/jwt';
import { DevicesService } from '../devices/devices.service';
import { DevicesRepository } from '../devices/devices.repository';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh.strategy';
import { BasicStrategy } from './strategies/basic.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]),
  ],
  providers: [
    AuthService,
    JwtService,
    DevicesService,
    DevicesRepository,
    LocalStrategy,
    JwtBearerStrategy,
    JwtRefreshTokenStrategy,
    BasicStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService, DevicesService],
})
export class AuthModule {}
