import { Module } from '@nestjs/common';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './api/superadmin/infrastructure/users.query.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.entity';
import { IsUserAlreadyExistConstraint } from '../exceptions/decorators/unique-user.decorator';
import { MailService } from '../mail/mail.service';
import { SuperAdminUsersController } from './api/superadmin/sa.users.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { SuperAdminCreateUserUseCase } from './api/superadmin/application/use-cases/sa.create-user.use-case';
import { SuperAdminDeleteUserUseCase } from './api/superadmin/application/use-cases/sa.delete-user.use-case';

const useCases = [SuperAdminCreateUserUseCase, SuperAdminDeleteUserUseCase];
const services = [MailService];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    CqrsModule,
  ],
  controllers: [SuperAdminUsersController],
  providers: [
    ...useCases,
    ...services,
    UsersRepository,
    UsersQueryRepository,
    IsUserAlreadyExistConstraint,
  ],
  exports: [UsersRepository, UsersQueryRepository],
})
export class UsersModule {}
