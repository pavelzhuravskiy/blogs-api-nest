import { Module } from '@nestjs/common';
import { BlogsController } from '../blogs/blogs.controller';
import { BlogsService } from '../blogs/blogs.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from '../blogs/schemas/blog.entity';
import { BlogsRepository } from '../blogs/blogs.repository';
import { BlogsQueryRepository } from '../blogs/blogs.query.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
  ],
  controllers: [BlogsController],
  providers: [BlogsService, BlogsRepository, BlogsQueryRepository],
})
export class MainModule {}
