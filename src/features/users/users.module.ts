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
import { BlogsRepository } from '../blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../posts/infrastructure/posts.repository';
import { Blog, BlogSchema } from '../blogs/blog.entity';
import { Post, PostSchema } from '../posts/post.entity';
import { CommentsRepository } from '../comments/infrastructure/comments.repository';
import { Comment, CommentSchema } from '../comments/comment.entity';
import { LikesRepository } from '../likes/infrastructure/likes.repository';

const useCases = [UserCreateUseCase, UserDeleteUseCase, UserBanUseCase];

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
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    CqrsModule,
  ],
  controllers: [SuperAdminUsersController],
  providers: [...useCases, ...repositories, IsUserAlreadyExistConstraint],
})
export class UsersModule {}
