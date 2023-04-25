import { Module } from '@nestjs/common';
import { BlogsController } from '../blogs/blogs.controller';
import { BlogsService } from '../blogs/blogs.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from '../blogs/schemas/blog.entity';
import { BlogsRepository } from '../blogs/blogs.repository';
import { BlogsQueryRepository } from '../blogs/blogs.query.repository';
import { PostsController } from '../posts/posts.controller';
import { PostsService } from '../posts/posts.service';
import { PostsRepository } from '../posts/posts.repository';
import { PostsQueryRepository } from '../posts/posts.query.repository';
import { Post, PostSchema } from '../posts/schemas/post.entity';
import { CommentsController } from '../comments/comments.controller';
import { CommentsQueryRepository } from '../comments/comments.query.repository';
import { CommentsRepository } from '../comments/comments.repository';
import { Comment, CommentSchema } from '../comments/schemas/comment.entity';
import { UsersController } from '../users/users.controller';
import { UsersService } from '../users/users.service';
import { UsersRepository } from '../users/users.repository';
import { UsersQueryRepository } from '../users/users.query.repository';
import { User, UserSchema } from '../users/schemas/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [
    BlogsController,
    PostsController,
    CommentsController,
    UsersController,
  ],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    CommentsQueryRepository,
    CommentsRepository,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
  ],
})
export class MainModule {}
