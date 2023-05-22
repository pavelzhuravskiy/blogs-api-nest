import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { PublicBlogsController } from '../../api/public/blogs/public.blogs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from '../../api/public/blogs/blog.entity';
import { BlogsRepository } from '../../api/public/blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from '../../api/public/blogs/infrastructure/blogs.query.repository';
import { PublicPostsController } from '../../api/public/posts/public.posts.controller';
import { PostsRepository } from '../../api/public/posts/infrastructure/posts.repository';
import { PostsQueryRepository } from '../../api/public/posts/infrastructure/posts.query.repository';
import { Post, PostSchema } from '../../api/public/posts/post.entity';
import {
  Comment,
  CommentSchema,
} from '../../api/public/comments/comment.entity';
import { UsersRepository } from '../../api/superadmin/users/infrastructure/users.repository';
import { User, UserSchema } from '../../api/superadmin/users/user.entity';
import { CommentsRepository } from '../../api/public/comments/infrastructure/comments.repository';
import { CommentsQueryRepository } from '../../api/public/comments/infrastructure/comments.query.repository';
import { LikesService } from '../../api/public/likes/application/likes.service';
import { LikesRepository } from '../../api/public/likes/infrastructure/likes.repository';
import { JwtService } from '@nestjs/jwt';
import { TokenParserMiddleware } from '../../middlewares/token-parser.middleware';
import { IsBlogExistConstraint } from '../../exceptions/decorators/blog-exists.decorator';
import { BloggerBlogsController } from '../../api/blogger/blogger.blogs.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { BlogCreateUseCase } from '../../api/blogger/application/use-cases/blog-create.use-case';
import { BlogUpdateUseCase } from '../../api/blogger/application/use-cases/blog-update.use-case';
import { BlogDeleteUseCase } from '../../api/blogger/application/use-cases/blog-delete.use-case';
import { PublicCommentsController } from '../../api/public/comments/public.comments.controller';
import { PostUpdateUseCase } from '../../api/blogger/application/use-cases/post-update.use-case';
import { PostCreateUseCase } from '../../api/blogger/application/use-cases/post-create.use-case';
import { PostDeleteUseCase } from '../../api/blogger/application/use-cases/post-delete.use-case';
import { SuperAdminBlogsController } from '../../api/superadmin/blogs/sa.blogs.controller';
import { BlogBindUseCase } from '../../api/superadmin/blogs/application/use-cases/blog-bind.use-case';
import { CommentCreateUseCase } from '../../api/public/comments/application/use-cases/comment-create.use-case';
import { CommentUpdateUseCase } from '../../api/public/comments/application/use-cases/comment-update.use-case';
import { CommentDeleteUseCase } from '../../api/public/comments/application/use-cases/comment-delete.use-case';
import { LikeUpdateForPostUseCase } from '../../api/public/likes/application/use-cases/like-update-for-post-use.case';
import { LikeUpdateForCommentUseCase } from '../../api/public/likes/application/use-cases/like-update-for-comment-use.case';

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
