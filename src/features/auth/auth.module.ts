import { Module } from '@nestjs/common';
import { PublicAuthController } from './api/public/public.auth.controller';
import { AuthService } from './api/public/application/auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtBearerStrategy } from './strategies/jwt-bearer.strategy';
import { JwtService } from '@nestjs/jwt';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh.strategy';
import { BasicStrategy } from './strategies/basic.strategy';
import { MailService } from '../mail/application/mail.service';
import { MailModule } from '../mail/mail.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/user.entity';
import { ThrottlerModule } from '@nestjs/throttler';
import { CqrsModule } from '@nestjs/cqrs';
import { Device, DeviceSchema } from '../devices/device.entity';
import { DevicesRepository } from '../devices/infrastructure/devices.repository';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { RegistrationUseCase } from './api/public/application/use-cases/registration/registration.use-case';
import { RegistrationEmailResendUseCase } from './api/public/application/use-cases/registration/registration-email-resend';
import { RegistrationConfirmationUseCase } from './api/public/application/use-cases/registration/registration-confirmation.use-case';
import { PasswordRecoveryUseCase } from './api/public/application/use-cases/password/password-recovery.use-case';
import { PasswordUpdateUseCase } from './api/public/application/use-cases/password/password-update.use-case';
import { DeviceCreateForLoginUseCase } from '../devices/api/public/application/use-cases/device-create-for-login.use-case';
import { DeviceUpdateForTokensUseCase } from '../devices/api/public/application/use-cases/device-update-for-tokens.use-case';
import { DeviceDeleteForLogoutUseCase } from '../devices/api/public/application/use-cases/device-delete-for-logout.use-case';
import { ValidateRefreshTokenUseCase } from './api/public/application/use-cases/validations/validate-refresh-token.use-case';
import { ValidateLoginAndPasswordUseCase } from './api/public/application/use-cases/validations/validate-login-pass.use-case';

const services = [AuthService, JwtService, MailService];

const useCases = [
  RegistrationUseCase,
  RegistrationEmailResendUseCase,
  RegistrationConfirmationUseCase,
  PasswordRecoveryUseCase,
  PasswordUpdateUseCase,
  ValidateLoginAndPasswordUseCase,
  ValidateRefreshTokenUseCase,
  DeviceCreateForLoginUseCase,
  DeviceUpdateForTokensUseCase,
  DeviceDeleteForLogoutUseCase,
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
