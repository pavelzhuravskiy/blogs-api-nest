import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UsersQueryRepository } from './users.query.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.entity';
import { UsersController } from './users.controller';
import { IsUserAlreadyExistConstraint } from '../exceptions/decorators/unique-user.decorator';
import { MailService } from '../mail/mail.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    MailService,
    IsUserAlreadyExistConstraint,
  ],
  exports: [UsersService, UsersRepository, UsersQueryRepository, MailService],
})
export class UsersModule {}
