import { Module } from '@nestjs/common';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/users.query.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.entity';
import { IsUserAlreadyExistConstraint } from '../../../exceptions/decorators/unique-user.decorator';
import { SuperAdminUsersController } from './sa.users.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { UserCreateUseCase } from './application/use-cases/user-create.use-case';
import { UserDeleteUseCase } from './application/use-cases/user-delete.use-case';
import { UserBanUseCase } from './application/use-cases/user-ban.use-case';
import { BlogsRepository } from '../../public/blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../../public/posts/infrastructure/posts.repository';
import { Blog, BlogSchema } from '../../public/blogs/blog.entity';
import { Post, PostSchema } from '../../public/posts/post.entity';
import { CommentsRepository } from '../../public/comments/infrastructure/comments.repository';
import { Comment, CommentSchema } from '../../public/comments/comment.entity';
import { LikesRepository } from '../../public/likes/infrastructure/likes.repository';

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
