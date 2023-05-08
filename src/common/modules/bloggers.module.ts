import { Module } from '@nestjs/common';
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
import { CommentsController } from '../../comments/comments.controller';
import { CommentsQueryRepository } from '../../comments/comments.query.repository';
import { CommentsRepository } from '../../comments/comments.repository';
import { Comment, CommentSchema } from '../../comments/schemas/comment.entity';
import { CommentsService } from '../../comments/comments.service';
import { UsersModule } from '../../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
    UsersModule,
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
  ],
  exports: [BlogsService, PostsService, CommentsService],
})
export class BloggersModule {}
