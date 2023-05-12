import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { BlogsController } from '../../blogs/blogs.controller';
import { BlogsService } from '../../blogs/blogs.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from '../../blogs/schemas/blog.entity';
import { BlogsRepository } from '../../blogs/blogs.repository';
import { BlogsQueryRepository } from '../../blogs/blogs.query.repository';
import { PostsController } from '../../posts/posts.controller';
import { PostsService } from '../../posts/posts.service';
import { PostsRepository } from '../../posts/posts.repository';
import { PostsQueryRepository } from '../../posts/posts.query.repository';
import { Post, PostSchema } from '../../posts/schemas/post.entity';
import { Comment, CommentSchema } from '../../comments/schemas/comment.entity';
import { UsersRepository } from '../../users/users.repository';
import { User, UserSchema } from '../../users/schemas/user.entity';
import { CommentsService } from '../../comments/comments.service';
import { CommentsRepository } from '../../comments/comments.repository';
import { CommentsQueryRepository } from '../../comments/comments.query.repository';
import { CommentsController } from '../../comments/comments.controller';
import { LikesService } from '../../likes/likes.service';
import { LikesRepository } from '../../likes/likes.repository';
import { JwtService } from '@nestjs/jwt';
import { TokenParserMiddleware } from '../../middlewares/token-parser.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    CommentsService,
    CommentsRepository,
    CommentsQueryRepository,
    UsersRepository,
    LikesService,
    LikesRepository,
    JwtService,
  ],
  exports: [
    BlogsService,
    PostsService,
    BlogsQueryRepository,
    PostsQueryRepository,
  ],
})
export class BloggersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TokenParserMiddleware)
      .forRoutes(
        { path: 'blogs/:id/posts', method: RequestMethod.GET },
        { path: 'posts', method: RequestMethod.GET },
        { path: 'posts/:id', method: RequestMethod.GET },
        { path: 'posts/:id/comments', method: RequestMethod.GET },
        { path: 'comments/:id', method: RequestMethod.GET },
      );
  }
}
