import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User, UserDocument, UserModelType } from './schemas/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}

  async save(user: UserDocument) {
    return user.save();
  }

  async findUser(id: string): Promise<UserDocument | null> {
    if (!mongoose.isValidObjectId(id)) {
      return null;
    }

    const user = await this.UserModel.findOne({ _id: id });

    if (!user) {
      return null;
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
