import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { BlogsController } from '../../blogs/_common/blogs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from '../../blogs/_common/blog.entity';
import { BlogsRepository } from '../../blogs/_common/infrastructure/blogs.repository';
import { BlogsQueryRepository } from '../../blogs/_common/infrastructure/blogs.query.repository';
import { PostsController } from '../../posts/posts.controller';
import { PostsService } from '../../posts/posts.service';
import { PostsRepository } from '../../posts/posts.repository';
import { PostsQueryRepository } from '../../posts/posts.query.repository';
import { Post, PostSchema } from '../../posts/schemas/post.entity';
import { Comment, CommentSchema } from '../../comments/schemas/comment.entity';
import { UsersRepository } from '../../users/users.repository';
import { User, UserSchema } from '../../users/schemas/user.entity';
import { CommentsRepository } from '../../comments/comments.repository';
import { CommentsQueryRepository } from '../../comments/comments.query.repository';
import { LikesService } from '../../likes/likes.service';
import { LikesRepository } from '../../likes/likes.repository';
import { JwtService } from '@nestjs/jwt';
import { TokenParserMiddleware } from '../../middlewares/token-parser.middleware';
import { IsBlogExistConstraint } from '../../exceptions/decorators/blog-exists.decorator';
import { BloggerBlogsController } from '../../blogs/blogger/blogger.blogs.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { BloggerCreateBlogUseCase } from '../../blogs/blogger/application/use-cases/blogs/blogger.create-blog.use-case';
import { BloggerUpdateBlogUseCase } from '../../blogs/blogger/application/use-cases/blogs/blogger.update-blog.use-case';
import { BloggerDeleteBlogUseCase } from '../../blogs/blogger/application/use-cases/blogs/blogger.delete-blog.use-case';
import { CommentsService } from '../../comments/comments.service';
import { CommentsController } from '../../comments/comments.controller';
import { BloggerUpdatePostUseCase } from '../../blogs/blogger/application/use-cases/posts/blogger.update-post.use-case';
import { BloggerCreatePostUseCase } from '../../blogs/blogger/application/use-cases/posts/blogger.create-post.use-case';
import { BloggerDeletePostUseCase } from '../../blogs/blogger/application/use-cases/posts/blogger.delete-post.use-case';

const controllers = [
  BloggerBlogsController,
  BlogsController,
  PostsController,
  CommentsController,
];

const services = [PostsService, CommentsService, LikesService, JwtService];

const useCases = [
  BloggerCreateBlogUseCase,
  BloggerUpdateBlogUseCase,
  BloggerDeleteBlogUseCase,
  BloggerCreatePostUseCase,
  BloggerUpdatePostUseCase,
  BloggerDeletePostUseCase,
];

const repositories = [
  BlogsRepository,
  PostsRepository,
  CommentsRepository,
  UsersRepository,
  LikesRepository,
];

const queryRepositories = [
  BlogsQueryRepository,
  PostsQueryRepository,
  CommentsQueryRepository,
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: User.name, schema: UserSchema },
    ]),
    CqrsModule,
  ],
  controllers: [...controllers],
  providers: [
    ...useCases,
    ...services,
    ...repositories,
    ...queryRepositories,
    IsBlogExistConstraint,
  ],
  exports: [BlogsQueryRepository, PostsService, PostsQueryRepository],
})
export class MainModule implements NestModule {
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
