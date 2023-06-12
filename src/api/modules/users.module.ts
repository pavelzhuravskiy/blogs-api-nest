import { Module } from '@nestjs/common';
import { UsersMongooseRepository } from '../infrastructure/_mongoose/users/users.mongoose.repository';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserMongooseEntity,
  UserSchema,
} from '../entities/_mongoose/user.entity';
import { IsLoginExistConstraint } from '../../exceptions/decorators/unique-login.decorator';
import { SuperAdminUsersController } from '../_superadmin/users/sa.users.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { UserCreateUseCase } from '../_superadmin/users/application/use-cases/user-create.use-case';
import { UserDeleteUseCase } from '../_superadmin/users/application/use-cases/user-delete.use-case';
import { UserBanUseCase } from '../_superadmin/users/application/use-cases/user-ban.use-case';
import { PostsMongooseRepository } from '../infrastructure/_mongoose/posts/posts.repository';
import {
  BlogMongooseEntity,
  BlogSchema,
} from '../entities/_mongoose/blog.entity';
import {
  PostMongooseEntity,
  PostSchema,
} from '../entities/_mongoose/post.entity';
import {
  CommentMongooseEntity,
  CommentSchema,
} from '../entities/_mongoose/comment.entity';
import { LikesRepository } from '../infrastructure/_mongoose/likes/likes.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/users/user.entity';
import { UserEmailConfirmation } from '../entities/users/user-email-confirmation.entity';
import { UserPasswordRecovery } from '../entities/users/user-password-recovery.entity';
import { UserBanBySA } from '../entities/users/user-ban-by-sa.entity';
import { UsersRepository } from '../infrastructure/users/users.repository';
import { IsEmailExistConstraint } from '../../exceptions/decorators/unique-email.decorator';
import { UsersQueryRepository } from '../infrastructure/users/users.query.repository';
import { DevicesRepository } from '../infrastructure/devices/devices.repository';
import { UserBanByBlogger } from '../entities/users/user-ban-by-blogger.entity';

const useCases = [UserCreateUseCase, UserDeleteUseCase, UserBanUseCase];

const entities = [
  User,
  UserEmailConfirmation,
  UserPasswordRecovery,
  UserBanBySA,
  UserBanByBlogger,
];

const mongooseRepositories = [
  UsersMongooseRepository,
  PostsMongooseRepository,
  LikesRepository,
];

const sqlRepositories = [
  UsersRepository,
  UsersQueryRepository,
  DevicesRepository,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([...entities]),
    MongooseModule.forFeature([
      { name: UserMongooseEntity.name, schema: UserSchema },
    ]),
    MongooseModule.forFeature([
      { name: BlogMongooseEntity.name, schema: BlogSchema },
    ]),
    MongooseModule.forFeature([
      { name: PostMongooseEntity.name, schema: PostSchema },
    ]),
    MongooseModule.forFeature([
      { name: CommentMongooseEntity.name, schema: CommentSchema },
    ]),
    CqrsModule,
  ],
  controllers: [SuperAdminUsersController],
  providers: [
    ...useCases,
    ...sqlRepositories,
    ...mongooseRepositories,
    IsLoginExistConstraint,
    IsEmailExistConstraint,
  ],
})
export class UsersModule {}
