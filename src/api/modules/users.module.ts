import { Module } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users/users.repository';
import { UsersQueryRepository } from '../infrastructure/users/users.query.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { UserMongoose, UserSchema } from '../entities/_mongoose/user.entity';
import { IsUserAlreadyExistConstraint } from '../../exceptions/decorators/unique-user.decorator';
import { SuperAdminUsersController } from '../_superadmin/users/sa.users.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { UserCreateUseCase } from '../_superadmin/users/application/use-cases/user-create.use-case';
import { UserDeleteUseCase } from '../_superadmin/users/application/use-cases/user-delete.use-case';
import { UserBanUseCase } from '../_superadmin/users/application/use-cases/user-ban.use-case';
import { BlogsRepository } from '../infrastructure/blogs/blogs.repository';
import { PostsRepository } from '../infrastructure/posts/posts.repository';
import { Blog, BlogSchema } from '../entities/_mongoose/blog.entity';
import { Post, PostSchema } from '../entities/_mongoose/post.entity';
import { CommentsRepository } from '../infrastructure/comments/comments.repository';
import { Comment, CommentSchema } from '../entities/_mongoose/comment.entity';
import { LikesRepository } from '../infrastructure/likes/likes.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/users/user.entity';
import { UserEmailConfirmation } from '../entities/users/user-email-confirmation.entity';
import { UserPasswordRecovery } from '../entities/users/user-password-recovery.entity';
import { UserBan } from '../entities/users/user-ban.entity';

const useCases = [UserCreateUseCase, UserDeleteUseCase, UserBanUseCase];

const entities = [User, UserEmailConfirmation, UserPasswordRecovery, UserBan];

const repositories = [
  UsersRepository,
  UsersQueryRepository,
  BlogsRepository,
  PostsRepository,
  CommentsRepository,
  LikesRepository,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([...entities]),
    MongooseModule.forFeature([
      { name: UserMongoose.name, schema: UserSchema },
    ]),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    CqrsModule,
  ],
  controllers: [SuperAdminUsersController],
  providers: [...useCases, ...repositories, IsUserAlreadyExistConstraint],
})
export class UsersModule {}
