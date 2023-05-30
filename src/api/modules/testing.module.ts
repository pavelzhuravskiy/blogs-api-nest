import { Module } from '@nestjs/common';
import { TestingController } from '../_public/testing/testing.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from '../entities/blog.entity';
import { Post, PostSchema } from '../entities/post.entity';
import { Comment, CommentSchema } from '../entities/comment.entity';
import { User, UserSchema } from '../entities/user.entity';
import { Device, DeviceSchema } from '../entities/device.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: User.name, schema: UserSchema },
      { name: Device.name, schema: DeviceSchema },
    ]),
  ],
  controllers: [TestingController],
})
export class TestingModule {}
