import { Module } from '@nestjs/common';
import { PublicAuthController } from '../_auth/public.auth.controller';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from '../_auth/strategies/local.strategy';
import { JwtBearerStrategy } from '../_auth/strategies/jwt-bearer.strategy';
import { JwtService } from '@nestjs/jwt';
import { JwtRefreshTokenStrategy } from '../_auth/strategies/jwt-refresh.strategy';
import { BasicStrategy } from '../_auth/strategies/basic.strategy';
import { ThrottlerModule } from '@nestjs/throttler';
import { CqrsModule } from '@nestjs/cqrs';
import { RegistrationUseCase } from '../_auth/application/use-cases/registration/registration.use-case';
import { RegistrationEmailResendUseCase } from '../_auth/application/use-cases/registration/registration-email-resend.use-case';
import { RegistrationConfirmationUseCase } from '../_auth/application/use-cases/registration/registration-confirmation.use-case';
import { PasswordRecoveryUseCase } from '../_auth/application/use-cases/password/password-recovery.use-case';
import { PasswordUpdateUseCase } from '../_auth/application/use-cases/password/password-update.use-case';
import { DeviceCreateForLoginUseCase } from '../_auth/application/use-cases/devices/device-create-for-login.use-case';
import { DeviceUpdateForTokensUseCase } from '../_auth/application/use-cases/devices/device-update-for-tokens.use-case';
import { DeviceDeleteForLogoutUseCase } from '../_auth/application/use-cases/devices/device-delete-for-logout.use-case';
import { ValidateRefreshTokenUseCase } from '../_auth/application/use-cases/validations/validate-refresh-token.use-case';
import { ValidateLoginAndPasswordUseCase } from '../_auth/application/use-cases/validations/validate-login-pass.use-case';
import { TokensCreateUseCase } from '../_auth/application/use-cases/tokens/tokens-create.use-case';
import { UsersRepository } from '../infrastructure/repositories/users/users.repository';
import { DevicesRepository } from '../infrastructure/repositories/devices/devices.repository';
import { Repository } from 'typeorm';
import { User } from '../entities/users/user.entity';
import { UsersModule } from './users.module';
import { MailAdapter } from '../infrastructure/mail/mail-adapter';
import { DevicesModule } from './devices.module';
import { UsersService } from '../_superadmin/users/application/users.service';
import { TransactionsRepository } from '../infrastructure/repositories/common/transactions.repository';
import { UsersTransactionsRepository } from '../infrastructure/repositories/users/users.transactions.repository';
import { DataSourceRepository } from '../infrastructure/repositories/common/data-source.repository';

const services = [JwtService];

const useCases = [
  MailAdapter,
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

const repositories = [
  UsersRepository,
  DevicesRepository,
  TransactionsRepository,
  UsersTransactionsRepository,
  DataSourceRepository,
];
const typeORMRepositories = [Repository<User>];

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
    CqrsModule,
    PassportModule,
    UsersModule,
    DevicesModule,
  ],
  controllers: [PublicAuthController],
  providers: [
    UsersService,
    ...services,
    ...useCases,
    ...repositories,
    ...typeORMRepositories,
    ...strategies,
  ],
})
export class AuthModule {}
