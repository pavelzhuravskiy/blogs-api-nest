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
import { PublicPostsController } from '../../posts/api/public/public.posts.controller';
import { PostsRepository } from '../../posts/infrastructure/posts.repository';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query.repository';
import { Post, PostSchema } from '../../posts/post.entity';
import { Comment, CommentSchema } from '../../comments/comment.entity';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { User, UserSchema } from '../../users/user.entity';
import { CommentsRepository } from '../../comments/infrastructure/comments.repository';
import { CommentsQueryRepository } from '../../comments/infrastructure/comments.query.repository';
import { LikesService } from '../../likes/api/public/application/likes.service';
import { LikesRepository } from '../../likes/infrastructure/likes.repository';
import { JwtService } from '@nestjs/jwt';
import { TokenParserMiddleware } from '../../../middlewares/token-parser.middleware';
import { IsBlogExistConstraint } from '../../../exceptions/decorators/blog-exists.decorator';
import { BloggerBlogsController } from '../../blogs/api/blogger/blogger.blogs.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { BlogCreateUseCase } from '../../blogs/api/blogger/application/use-cases/blog-create.use-case';
import { BlogUpdateUseCase } from '../../blogs/api/blogger/application/use-cases/blog-update.use-case';
import { BlogDeleteUseCase } from '../../blogs/api/blogger/application/use-cases/blog-delete.use-case';
import { PublicCommentsController } from '../../comments/api/public/public.comments.controller';
import { PostUpdateUseCase } from '../../posts/api/blogger/application/use-cases/post-update.use-case';
import { PostCreateUseCase } from '../../posts/api/blogger/application/use-cases/post-create.use-case';
import { PostDeleteUseCase } from '../../posts/api/blogger/application/use-cases/post-delete.use-case';
import { SuperAdminBlogsController } from '../../blogs/api/superadmin/sa.blogs.controller';
import { BlogBindUseCase } from '../../blogs/api/superadmin/application/use-cases/blog-bind.use-case';
import { CommentCreateUseCase } from '../../comments/api/public/application/use-cases/comment-create.use-case';
import { CommentUpdateUseCase } from '../../comments/api/public/application/use-cases/comment-update.use-case';
import { CommentDeleteUseCase } from '../../comments/api/public/application/use-cases/comment-delete.use-case';
import { LikeUpdateForPostUseCase } from '../../likes/api/public/application/use-cases/like-update-for-post-use.case';
import { LikeUpdateForCommentUseCase } from '../../likes/api/public/application/use-cases/like-update-for-comment-use.case';
import { BlogsFindNotBannedUseCase } from '../../blogs/api/superadmin/application/use-cases/blogs-find-not-banned-use.case';
import { UsersFindNotBannedUseCase } from '../../users/api/superadmin/application/use-cases/users-find-not-banned-use.case';

const controllers = [
  SuperAdminBlogsController,
  BloggerBlogsController,
  PublicBlogsController,
  PublicPostsController,
  PublicCommentsController,
];

const services = [LikesService, JwtService];

const useCases = [
  BlogBindUseCase,
  BlogCreateUseCase,
  BlogUpdateUseCase,
  BlogDeleteUseCase,
  PostCreateUseCase,
  PostUpdateUseCase,
  PostDeleteUseCase,
  CommentCreateUseCase,
  CommentUpdateUseCase,
  CommentDeleteUseCase,
  LikeUpdateForPostUseCase,
  LikeUpdateForCommentUseCase,
  BlogsFindNotBannedUseCase,
  UsersFindNotBannedUseCase,
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
