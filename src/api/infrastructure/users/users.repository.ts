import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User, UserDocument, UserModelType } from '../../entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}

  async save(user: UserDocument) {
    return user.save();
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
    const user = await this.UserModel.findOne({
      $or: [
        { 'accountData.login': loginOrEmail },
        { 'accountData.email': loginOrEmail },
      ],
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async findUserByEmailCode(code: string): Promise<UserDocument | null> {
    const user = this.UserModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async findUserByRecoveryCode(code: string): Promise<UserDocument | null> {
    const user = this.UserModel.findOne({
      'passwordRecovery.recoveryCode': code,
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = await this.UserModel.deleteOne({ _id: id });
    return user.deletedCount === 1;
  }

  async findUserBanForBlog(
    userId: string,
    blogId: string,
  ): Promise<UserDocument | null> {
    const user = await this.UserModel.findOne({
      _id: userId,
      'bansForBlogs.banInfo.blogId': blogId,
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async banUserForBlog(
    blogId: string,
    userId: string,
    userLogin: string,
    banReason: string,
  ): Promise<boolean> {
    const result = await this.UserModel.updateOne(
      { _id: userId },
      {
        $push: {
          bansForBlogs: {
            id: userId,
            login: userLogin,
            banInfo: {
              isBanned: true,
              banDate: new Date(),
              banReason: banReason,
              blogId: blogId,
            },
          },
        },
      },
    );
    return result.matchedCount === 1;
  }

  async unbanUserForBlog(blogId: string, userId: string): Promise<any> {
    const result = await this.UserModel.updateOne(
      { 'bansForBlogs.banInfo.blogId': blogId },
      {
        $pull: {
          bansForBlogs: {
            id: userId,
          },
        },
      },
    );
    return result.matchedCount === 1;
  }
}
