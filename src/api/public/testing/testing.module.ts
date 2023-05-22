import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from '../blogs/blog.entity';
import { Post, PostSchema } from '../posts/post.entity';
import { Comment, CommentSchema } from '../comments/comment.entity';
import { User, UserSchema } from '../../superadmin/users/user.entity';
import { Device, DeviceSchema } from '../devices/device.entity';

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
