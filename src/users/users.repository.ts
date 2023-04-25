import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User, UserDocument, UserModelType } from './schemas/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}

  async createUser(user: UserDocument) {
    await user.save();
    return {
      id: user._id.toString(),
      login: user.accountData.login,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt.toISOString(),
    };
  }

  async findUser(id: string): Promise<UserDocument | null> {
    if (!mongoose.isValidObjectId(id)) {
      throw new NotFoundException();
    }

    const user = await this.UserModel.findOne({ _id: id });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = await this.UserModel.deleteOne({ _id: id });
    return user.deletedCount === 1;
  }

  async deleteUsers(): Promise<boolean> {
    await this.UserModel.deleteMany({});
    return (await this.UserModel.countDocuments()) === 0;
  }
}
