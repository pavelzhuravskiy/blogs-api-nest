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

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
  ],
  controllers: [BlogsController, PostsController],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    PostsService,
    PostsRepository,
    PostsQueryRepository,
  ],
})
export class MainModule {}
