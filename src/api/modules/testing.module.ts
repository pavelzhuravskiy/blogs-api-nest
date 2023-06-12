import { Module } from '@nestjs/common';
import { TestingController } from '../_testing/testing.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  BlogMongooseEntity,
  BlogSchema,
} from '../entities/_mongoose/blog.entity';
import {
  PostMongooseEntity,
  PostSchema,
} from '../entities/_mongoose/post.entity';
import {
  CommentMongooseEntity,
  CommentSchema,
} from '../entities/_mongoose/comment.entity';
import {
  UserMongooseEntity,
  UserSchema,
} from '../entities/_mongoose/user.entity';
import {
  DeviceMongooseEntity,
  DeviceSchema,
} from '../entities/_mongoose/device.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BlogMongooseEntity.name, schema: BlogSchema },
      { name: PostMongooseEntity.name, schema: PostSchema },
      { name: CommentMongooseEntity.name, schema: CommentSchema },
      { name: UserMongooseEntity.name, schema: UserSchema },
      { name: DeviceMongooseEntity.name, schema: DeviceSchema },
    ]),
  ],
  controllers: [TestingController],
})
export class TestingModule {}
