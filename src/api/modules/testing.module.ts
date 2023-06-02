import { Module } from '@nestjs/common';
import { TestingController } from '../_public/testing/testing.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from '../entities/_mongoose/blog.entity';
import { Post, PostSchema } from '../entities/_mongoose/post.entity';
import { Comment, CommentSchema } from '../entities/_mongoose/comment.entity';
import { UserMongoose, UserSchema } from '../entities/_mongoose/user.entity';
import { Device, DeviceSchema } from '../entities/_mongoose/device.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: UserMongoose.name, schema: UserSchema },
      { name: Device.name, schema: DeviceSchema },
    ]),
  ],
  controllers: [TestingController],
})
export class TestingModule {}
