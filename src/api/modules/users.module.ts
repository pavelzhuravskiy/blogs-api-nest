import { Module } from '@nestjs/common';
import { IsLoginExistConstraint } from '../../exceptions/decorators/unique-login.decorator';
import { SuperAdminUsersController } from '../_superadmin/users/sa.users.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { UserCreateUseCase } from '../_superadmin/users/application/use-cases/user-create.use-case';
import { UserDeleteUseCase } from '../_superadmin/users/application/use-cases/user-delete.use-case';
import { UserBanUseCase } from '../_superadmin/users/application/use-cases/user-ban.use-case';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from '../infrastructure/repositories/users/users.repository';
import { IsEmailExistConstraint } from '../../exceptions/decorators/unique-email.decorator';
import { UsersQueryRepository } from '../infrastructure/repositories/users/users.query.repository';
import { DevicesRepository } from '../infrastructure/repositories/devices/devices.repository';
import { User } from '../entities/users/user.entity';
import { UserBanBySA } from '../entities/users/user-ban-by-sa.entity';
import { UserEmailConfirmation } from '../entities/users/user-email-confirmation.entity';
import { UserPasswordRecovery } from '../entities/users/user-password-recovery.entity';
import { DevicesModule } from './devices.module';

const useCases = [UserCreateUseCase, UserDeleteUseCase, UserBanUseCase];

const entities = [
  User,
  UserEmailConfirmation,
  UserPasswordRecovery,
  UserBanBySA,
  // UserBanByBlogger,
];

const repositories = [UsersRepository, UsersQueryRepository, DevicesRepository];

@Module({
  imports: [TypeOrmModule.forFeature([...entities]), DevicesModule, CqrsModule],
  controllers: [SuperAdminUsersController],
  providers: [
    ...useCases,
    ...repositories,
    IsLoginExistConstraint,
    IsEmailExistConstraint,
  ],
  exports: [TypeOrmModule],
})
export class UsersModule {}
