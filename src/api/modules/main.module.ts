import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { PublicBlogsController } from '../_public/blogs/public.blogs.controller';
import { PublicPostsController } from '../_public/posts/public.posts.controller';
import { JwtService } from '@nestjs/jwt';
import { TokenParserMiddleware } from '../../middlewares/token-parser.middleware';
import { IsBlogExistConstraint } from '../../exceptions/decorators/blog-exists.decorator';
import { BloggerBlogsController } from '../_blogger/blogger.blogs.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { BlogCreateUseCase } from '../_blogger/application/use-cases/blog-create.use-case';
import { BlogUpdateUseCase } from '../_blogger/application/use-cases/blog-update.use-case';
import { BlogDeleteUseCase } from '../_blogger/application/use-cases/blog-delete.use-case';
import { PublicCommentsController } from '../_public/comments/public.comments.controller';
import { PostUpdateUseCase } from '../_blogger/application/use-cases/post-update.use-case';
import { PostCreateUseCase } from '../_blogger/application/use-cases/post-create.use-case';
import { PostDeleteUseCase } from '../_blogger/application/use-cases/post-delete.use-case';
import { SuperAdminBlogsController } from '../_superadmin/blogs/sa.blogs.controller';
import { BlogBindUseCase } from '../_superadmin/blogs/application/use-cases/blog-bind.use-case';
import { CommentCreateUseCase } from '../_public/comments/application/use-cases/comment-create.use-case';
import { CommentUpdateUseCase } from '../_public/comments/application/use-cases/comment-update.use-case';
import { CommentDeleteUseCase } from '../_public/comments/application/use-cases/comment-delete.use-case';
import { LikeUpdateForPostUseCase } from '../_public/likes/application/use-cases/like-update-for-post-use.case';
import { LikeUpdateForCommentUseCase } from '../_public/likes/application/use-cases/like-update-for-comment-use.case';
import { BloggerUserBanUseCase } from '../_blogger/application/use-cases/user-ban.use-case';
import { BloggerUsersController } from '../_blogger/blogger.users.controller';
import { BlogBanUseCase } from '../_superadmin/blogs/application/use-cases/blog-ban.use-case';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogsRepository } from '../infrastructure/repositories/blogs/blogs.repository';
import { UsersRepository } from '../infrastructure/repositories/users/users.repository';
import { BlogsQueryRepository } from '../infrastructure/repositories/blogs/blogs.query.repository';
import { PostsRepository } from '../infrastructure/repositories/posts/posts.repository';
import { PostsQueryRepository } from '../infrastructure/repositories/posts/posts.query.repository';
import { UsersQueryRepository } from '../infrastructure/repositories/users/users.query.repository';
import { UsersGetBannedUseCase } from '../_blogger/application/use-cases/users-get-banned.use-case';
import { CommentsQueryRepository } from '../infrastructure/repositories/comments/comments.query.repository';
import { CommentsRepository } from '../infrastructure/repositories/comments/comments.repository';
import { UsersModule } from './users.module';
import { Blog } from '../entities/blogs/blog.entity';
import { BlogBan } from '../entities/blogs/blog-ban.entity';
import { Post } from '../entities/posts/post.entity';
import { Comment } from '../entities/comments/comment.entity';
import { CommentLike } from '../entities/comments/comment-like.entity';
import { PostLike } from '../entities/posts/post-like.entity';
import { TransactionsRepository } from '../infrastructure/repositories/common/transactions.repository';
import { UsersTransactionsRepository } from '../infrastructure/repositories/users/users.transactions.repository';
import { DataSourceRepository } from '../infrastructure/repositories/common/data-source.repository';
import { BlogAddMainImageUseCase } from '../_blogger/application/use-cases/blog-add-img-main.use-case';
import { S3Adapter } from '../infrastructure/aws/s3-adapter';
import { BlogMainImage } from '../entities/blogs/blog-image-main.entity';

const entities = [
  Blog,
  BlogBan,
  BlogMainImage,
  Post,
  PostLike,
  Comment,
  CommentLike,
];

const controllers = [
  SuperAdminBlogsController,
  BloggerBlogsController,
  BloggerUsersController,
  PublicBlogsController,
  PublicPostsController,
  PublicCommentsController,
];

const services = [JwtService];

const useCases = [
  BlogBanUseCase,
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
  BloggerUserBanUseCase,
  UsersGetBannedUseCase,
  BlogAddMainImageUseCase,
];

const repositories = [
  BlogsRepository,
  PostsRepository,
  UsersRepository,
  CommentsRepository,
  UsersTransactionsRepository,
  TransactionsRepository,
  DataSourceRepository,
];
const queryRepositories = [
  BlogsQueryRepository,
  PostsQueryRepository,
  UsersQueryRepository,
  CommentsQueryRepository,
];

@Module({
  imports: [TypeOrmModule.forFeature([...entities]), UsersModule, CqrsModule],
  controllers: [...controllers],
  providers: [
    ...services,
    ...useCases,
    ...repositories,
    ...queryRepositories,
    IsBlogExistConstraint,
    S3Adapter,
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
