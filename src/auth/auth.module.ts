import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtBearerStrategy } from './strategies/jwt-bearer.strategy';
import { JwtService } from '@nestjs/jwt';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh.strategy';
import { BasicStrategy } from './strategies/basic.strategy';
import { DevicesModule } from '../devices/devices.module';

@Module({
  imports: [UsersModule, PassportModule, DevicesModule],
  providers: [
    AuthService,
    JwtService,
    LocalStrategy,
    JwtBearerStrategy,
    JwtRefreshTokenStrategy,
    BasicStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
