import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceModelType } from '../../entities/device.entity';
import { Blog, BlogModelType } from '../../entities/blog.entity';
import { Post, PostModelType } from '../../entities/post.entity';
import { Comment, CommentModelType } from '../../entities/comment.entity';
import { User, UserModelType } from '../../entities/user.entity';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    @InjectModel(User.name)
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
