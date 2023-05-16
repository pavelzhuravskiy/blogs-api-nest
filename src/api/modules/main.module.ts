import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { PublicBlogsController } from '../../blogs/api/public/public.blogs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from '../../blogs/blog.entity';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from '../../blogs/infrastructure/blogs.query.repository';
import { PostsController } from '../../posts/posts.controller';
import { PostsService } from '../../posts/posts.service';
import { PostsRepository } from '../../posts/posts.repository';
import { PostsQueryRepository } from '../../posts/posts.query.repository';
import { Post, PostSchema } from '../../posts/schemas/post.entity';
import { Comment, CommentSchema } from '../../comments/schemas/comment.entity';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { User, UserSchema } from '../../users/user.entity';
import { CommentsRepository } from '../../comments/comments.repository';
import { CommentsQueryRepository } from '../../comments/comments.query.repository';
import { LikesService } from '../../likes/likes.service';
import { LikesRepository } from '../../likes/likes.repository';
import { JwtService } from '@nestjs/jwt';
import { TokenParserMiddleware } from '../../middlewares/token-parser.middleware';
import { IsBlogExistConstraint } from '../../exceptions/decorators/blog-exists.decorator';
import { BloggerBlogsController } from '../../blogs/api/blogger/blogger.blogs.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { BloggerCreateBlogUseCase } from '../../blogs/api/blogger/application/use-cases/blogs/blogger.create-blog.use-case';
import { BloggerUpdateBlogUseCase } from '../../blogs/api/blogger/application/use-cases/blogs/blogger.update-blog.use-case';
import { BloggerDeleteBlogUseCase } from '../../blogs/api/blogger/application/use-cases/blogs/blogger.delete-blog.use-case';
import { CommentsService } from '../../comments/comments.service';
import { CommentsController } from '../../comments/comments.controller';
import { BloggerUpdatePostUseCase } from '../../blogs/api/blogger/application/use-cases/posts/blogger.update-post.use-case';
import { BloggerCreatePostUseCase } from '../../blogs/api/blogger/application/use-cases/posts/blogger.create-post.use-case';
import { BloggerDeletePostUseCase } from '../../blogs/api/blogger/application/use-cases/posts/blogger.delete-post.use-case';
import { SuperAdminBlogsController } from '../../blogs/api/superadmin/sa.blogs.controller';
import { SuperAdminBindBlogUseCase } from '../../blogs/api/superadmin/application/use-cases/sa.bind-blog.use-case';

const controllers = [
  BloggerBlogsController,
  SuperAdminBlogsController,
  PublicBlogsController,
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
  SuperAdminBindBlogUseCase,
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
    ...services,
    ...useCases,
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
