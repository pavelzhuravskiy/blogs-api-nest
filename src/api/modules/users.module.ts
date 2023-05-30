import { Module } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users/users.repository';
import { UsersQueryRepository } from '../infrastructure/users/users.query.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../entities/user.entity';
import { IsUserAlreadyExistConstraint } from '../../exceptions/decorators/unique-user.decorator';
import { SuperAdminUsersController } from '../_superadmin/users/sa.users.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { UserCreateUseCase } from '../_superadmin/users/application/use-cases/user-create.use-case';
import { UserDeleteUseCase } from '../_superadmin/users/application/use-cases/user-delete.use-case';
import { UserBanUseCase } from '../_superadmin/users/application/use-cases/user-ban.use-case';
import { BlogsRepository } from '../infrastructure/blogs/blogs.repository';
import { PostsRepository } from '../infrastructure/posts/posts.repository';
import { Blog, BlogSchema } from '../entities/blog.entity';
import { Post, PostSchema } from '../entities/post.entity';
import { CommentsRepository } from '../infrastructure/comments/comments.repository';
import { Comment, CommentSchema } from '../entities/comment.entity';
import { LikesRepository } from '../infrastructure/likes/likes.repository';

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
