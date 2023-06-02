import { Module } from '@nestjs/common';
import { PublicAuthController } from './public.auth.controller';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtBearerStrategy } from './strategies/jwt-bearer.strategy';
import { JwtService } from '@nestjs/jwt';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh.strategy';
import { BasicStrategy } from './strategies/basic.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserMongoose,
  UserSchema,
} from '../api/entities/_mongoose/user.entity';
import { ThrottlerModule } from '@nestjs/throttler';
import { CqrsModule } from '@nestjs/cqrs';
import { Device, DeviceSchema } from '../api/entities/_mongoose/device.entity';
import { DevicesRepository } from '../api/infrastructure/devices/devices.repository';
import { UsersRepository } from '../api/infrastructure/users/users.repository';
import { RegistrationUseCase } from './application/use-cases/registration/registration.use-case';
import { RegistrationEmailResendUseCase } from './application/use-cases/registration/registration-email-resend.use-case';
import { RegistrationConfirmationUseCase } from './application/use-cases/registration/registration-confirmation.use-case';
import { PasswordRecoveryUseCase } from './application/use-cases/password/password-recovery.use-case';
import { PasswordUpdateUseCase } from './application/use-cases/password/password-update.use-case';
import { DeviceCreateForLoginUseCase } from './application/use-cases/devices/device-create-for-login.use-case';
import { DeviceUpdateForTokensUseCase } from './application/use-cases/devices/device-update-for-tokens.use-case';
import { DeviceDeleteForLogoutUseCase } from './application/use-cases/devices/device-delete-for-logout.use-case';
import { ValidateRefreshTokenUseCase } from './application/use-cases/validations/validate-refresh-token.use-case';
import { ValidateLoginAndPasswordUseCase } from './application/use-cases/validations/validate-login-pass.use-case';
import { TokensCreateUseCase } from './application/use-cases/tokens/tokens-create.use-case';

const services = [JwtService];

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
  TokensCreateUseCase,
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
      { name: UserMongoose.name, schema: UserSchema },
    ]),
    CqrsModule,
    PassportModule,
  ],
  controllers: [PublicAuthController],
  providers: [...services, ...useCases, ...repositories, ...strategies],
})
export class AuthModule {}
