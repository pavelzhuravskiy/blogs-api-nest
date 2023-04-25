import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { UserAccountSchema } from './user.account.schema';
import { UserEmailSchema } from './user.email.schema';
import { UserPasswordSchema } from './user.password.schema';
import { UserCreateDto } from '../dto/user.create.dto';

export type UserDocument = HydratedDocument<User>;

export type UserModelStaticType = {
  createUser: (
    createUserDto: UserCreateDto,
    UserModel: UserModelType,
    hash: string,
  ) => UserDocument;
};

export type UserModelType = Model<User> & UserModelStaticType;

@Schema()
export class User {
  @Prop({ required: true })
  accountData: UserAccountSchema;

  @Prop({ required: true })
  emailConfirmation: UserEmailSchema;

  @Prop({ required: true })
  passwordRecovery: UserPasswordSchema;

  static createUser(
    createUserDto: UserCreateDto,
    UserModel: UserModelType,
    hash: string,
  ): UserDocument {
    const user = {
      accountData: {
        login: createUserDto.login,
        passwordHash: hash,
        email: createUserDto.email,
        createdAt: new Date(),
        isMembership: false,
      },
      emailConfirmation: {
        confirmationCode: null,
        expirationDate: null,
        isConfirmed: true,
      },
      passwordRecovery: {
        recoveryCode: null,
        expirationDate: null,
      },
    };
    return new UserModel(user);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

const userStaticMethods: UserModelStaticType = {
  createUser: User.createUser,
};

UserSchema.statics = userStaticMethods;
