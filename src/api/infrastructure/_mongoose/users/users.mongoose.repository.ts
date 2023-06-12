import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import {
  UserMongooseEntity,
  UserDocument,
  UserModelType,
} from '../../../entities/_mongoose/user.entity';

@Injectable()
export class UsersMongooseRepository {
  constructor(
    @InjectModel(UserMongooseEntity.name)
    private UserModel: UserModelType,
  ) {}

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
}
