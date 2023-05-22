import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceModelType } from '../devices/device.entity';
import { Blog, BlogModelType } from '../blogs/blog.entity';
import { Post, PostModelType } from '../posts/post.entity';
import { Comment, CommentModelType } from '../comments/comment.entity';
import { User, UserModelType } from '../../superadmin/users/user.entity';

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
