import { Module } from '@nestjs/common';
import { PublicAuthController } from './public.auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtBearerStrategy } from './strategies/jwt-bearer.strategy';
import { JwtService } from '@nestjs/jwt';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh.strategy';
import { BasicStrategy } from './strategies/basic.strategy';
import { MailService } from '../mail/mail.service';
import { MailModule } from '../mail/mail.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/user.entity';
import { ThrottlerModule } from '@nestjs/throttler';
import { CqrsModule } from '@nestjs/cqrs';
import { DevicesService } from '../devices/devices.service';
import { Device, DeviceSchema } from '../devices/schemas/device.entity';
import { DevicesRepository } from '../devices/devices.repository';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { RegisterUserUseCase } from './application/use-cases/registration/reg.register-user.use-case';
import { ResendEmailUseCase } from './application/use-cases/registration/reg.resend-email.use-case';
import { ConfirmUserUseCase } from './application/use-cases/registration/reg.confirm-user.use-case';
import { RecoverPasswordUseCase } from './application/use-cases/password-recovery/pass.recover.use-case';
import { UpdatePasswordUseCase } from './application/use-cases/password-recovery/pass.update.use-case';

const services = [AuthService, JwtService, DevicesService, MailService];

const useCases = [
  RegisterUserUseCase,
  ResendEmailUseCase,
  ConfirmUserUseCase,
  RecoverPasswordUseCase,
  UpdatePasswordUseCase,
];

const repositories = [DevicesRepository, UsersRepository];

const strategies = [
  BasicStrategy,
  JwtBearerStrategy,
  JwtRefreshTokenStrategy,
  LocalStrategy,
];

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    MongooseModule.forFeature([
      { name: Device.name, schema: DeviceSchema },
      { name: User.name, schema: UserSchema },
    ]),
    CqrsModule,
    PassportModule,
    MailModule,
  ],
  controllers: [PublicAuthController],
  providers: [...services, ...useCases, ...repositories, ...strategies],
})
export class AuthModule {}
