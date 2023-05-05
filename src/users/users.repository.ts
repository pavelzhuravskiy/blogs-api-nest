import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User, UserDocument, UserModelType } from './schemas/user.entity';
import { UserViewModel } from './schemas/user.view';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}

  async save(user: UserDocument) {
    return user.save();
  }

  async createUser(user: UserDocument): Promise<UserViewModel> {
    await user.save();
    return {
      id: user._id.toString(),
      login: user.accountData.login,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt.toISOString(),
    };
  }

  async findUserById(id: string): Promise<UserDocument | null> {
    if (!mongoose.isValidObjectId(id)) {
      return null;
    }

    const user = await this.UserModel.findOne({ _id: id });

    if (!user) {
      return null;
    }

    return user;
  }

  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserDocument | null> {
    const foundUser = await this.UserModel.findOne({
      $or: [
        { 'accountData.login': loginOrEmail },
        { 'accountData.email': loginOrEmail },
      ],
    });

    if (!foundUser) {
      return null;
    }

    return foundUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = await this.UserModel.deleteOne({ _id: id });
    return user.deletedCount === 1;
  }
}
