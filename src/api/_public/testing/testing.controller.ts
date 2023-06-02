import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Device,
  DeviceModelType,
} from '../../entities/_mongoose/device.entity';
import { Blog, BlogModelType } from '../../entities/_mongoose/blog.entity';
import { Post, PostModelType } from '../../entities/_mongoose/post.entity';
import {
  Comment,
  CommentModelType,
} from '../../entities/_mongoose/comment.entity';
import {
  UserMongoose,
  UserModelType,
} from '../../entities/_mongoose/user.entity';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    @InjectModel(UserMongoose.name)
    private UserModel: UserModelType,
    @InjectModel(Device.name)
    private DeviceModel: DeviceModelType,
  ) {}

  @Delete('all-data')
  @HttpCode(204)
  async deleteAll() {
    await this.BlogModel.deleteMany();
    await this.PostModel.deleteMany();
    await this.CommentModel.deleteMany();
    await this.UserModel.deleteMany();
    await this.DeviceModel.deleteMany();
  }
}
