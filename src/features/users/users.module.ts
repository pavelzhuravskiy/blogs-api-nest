import { Module } from '@nestjs/common';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './api/superadmin/infrastructure/users.query.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.entity';
import { IsUserAlreadyExistConstraint } from '../../exceptions/decorators/unique-user.decorator';
import { SuperAdminUsersController } from './api/superadmin/sa.users.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { UserCreateUseCase } from './api/superadmin/application/use-cases/user-create.use-case';
import { UserDeleteUseCase } from './api/superadmin/application/use-cases/user-delete.use-case';
import { UserBanUseCase } from './api/superadmin/application/use-cases/user-ban.use-case';

const useCases = [UserCreateUseCase, UserDeleteUseCase, UserBanUseCase];
const repositories = [UsersRepository, UsersQueryRepository];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    CqrsModule,
  ],
  controllers: [SuperAdminUsersController],
  providers: [...useCases, ...repositories, IsUserAlreadyExistConstraint],
})
export class UsersModule {}
