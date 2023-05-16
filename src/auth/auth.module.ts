import { Module } from '@nestjs/common';
import { UsersModule } from '../users/_common/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtBearerStrategy } from './strategies/jwt-bearer.strategy';
import { JwtService } from '@nestjs/jwt';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh.strategy';
import { BasicStrategy } from './strategies/basic.strategy';
import { DevicesModule } from '../devices/devices.module';
import { MailService } from '../mail/mail.service';
import { MailModule } from '../mail/mail.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/user.entity';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UsersModule,
    PassportModule,
    DevicesModule,
    MailModule,
  ],
  providers: [
    AuthService,
    JwtService,
    MailService,
    LocalStrategy,
    JwtBearerStrategy,
    JwtRefreshTokenStrategy,
    BasicStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
