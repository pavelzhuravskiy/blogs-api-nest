import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { PublicBlogsController } from '../_public/blogs/public.blogs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from '../entities/_mongoose/blog.entity';
import { BlogsRepository } from '../infrastructure/blogs/blogs.repository';
import { BlogsQueryRepository } from '../infrastructure/blogs/blogs.query.repository';
import { PublicPostsController } from '../_public/posts/public.posts.controller';
import { PostsRepository } from '../infrastructure/posts/posts.repository';
import { PostsQueryRepository } from '../infrastructure/posts/posts.query.repository';
import { Post, PostSchema } from '../entities/_mongoose/post.entity';
import { Comment, CommentSchema } from '../entities/_mongoose/comment.entity';
import { UsersRepository } from '../infrastructure/users/users.repository';
import { UserMongoose, UserSchema } from '../entities/_mongoose/user.entity';
import { CommentsRepository } from '../infrastructure/comments/comments.repository';
import { CommentsQueryRepository } from '../infrastructure/comments/comments.query.repository';
import { LikesService } from '../_public/likes/application/likes.service';
import { LikesRepository } from '../infrastructure/likes/likes.repository';
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
import { UsersQueryRepository } from '../infrastructure/users/users.query.repository';
import { BlogBanUseCase } from '../_superadmin/blogs/application/use-cases/blog-ban.use-case';

const controllers = [
  SuperAdminBlogsController,
  BloggerBlogsController,
  BloggerUsersController,
  PublicBlogsController,
  PublicPostsController,
  PublicCommentsController,
];

const services = [LikesService, JwtService];

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
  UsersQueryRepository,
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: UserMongoose.name, schema: UserSchema },
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
