import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { UserAccountSchema } from '../../dto/users/schemas/user-account.schema';
import { UserEmailSchema } from '../../dto/users/schemas/user-email.schema';
import { UserPasswordSchema } from '../../dto/users/schemas/user-password.schema';
import { UserInputDto } from '../../dto/users/input/user-input.dto';
import { add } from 'date-fns';
import { UserBanSchema } from '../../dto/users/schemas/user-ban.schema';
import { SAUserBanInputDto } from '../../dto/users/input/superadmin/sa.user-ban.input.dto';
import { UserBanForBlogSchema } from '../../dto/users/schemas/user-ban-for-blog.schema';

export type UserDocument = HydratedDocument<UserMongoose>;
export type UserLeanType = UserMongoose & { _id: Types.ObjectId };

export type UserModelStaticType = {
  createUser: (
    UserModel: UserModelType,
    userInputDto: UserInputDto,
    hash: string,
    emailData?: UserEmailSchema,
  ) => UserDocument;
};

export type UserModelType = Model<UserMongoose> & UserModelStaticType;

@Schema()
export class UserMongoose {
  @Prop({ required: true })
  accountData: UserAccountSchema;

  @Prop({ required: true })
  emailConfirmation: UserEmailSchema;

  @Prop({ required: true })
  passwordRecovery: UserPasswordSchema;

  @Prop({ required: true })
  banInfo: UserBanSchema;

  @Prop({ default: [] })
  bansForBlogs: [UserBanForBlogSchema];

  userCanBeConfirmed() {
    if (
      this.emailConfirmation.isConfirmed ||
      this.emailConfirmation.expirationDate < new Date()
    ) {
      return null;
    }

    return true;
  }

  passwordCanBeUpdated() {
    if (this.passwordRecovery.expirationDate < new Date()) {
      return null;
    }

    return true;
  }

  confirmUser() {
    this.emailConfirmation.confirmationCode = null;
    this.emailConfirmation.expirationDate = null;
    this.emailConfirmation.isConfirmed = true;
  }

  updateEmailConfirmationData(newConfirmationCode: string) {
    this.emailConfirmation.confirmationCode = newConfirmationCode;
    this.emailConfirmation.expirationDate = add(new Date(), { hours: 1 });
  }

  updatePasswordRecoveryData(recoveryCode: string) {
    this.passwordRecovery.recoveryCode = recoveryCode;
    this.passwordRecovery.expirationDate = add(new Date(), { hours: 1 });
  }

  updatePassword(hash: string) {
    this.accountData.passwordHash = hash;
    this.passwordRecovery.recoveryCode = null;
    this.passwordRecovery.expirationDate = null;
  }

  saBanUser(saUserBanInputDto: SAUserBanInputDto) {
    this.banInfo.isBanned = true;
    this.banInfo.banDate = new Date();
    this.banInfo.banReason = saUserBanInputDto.banReason;
  }

  saUnbanUser() {
    this.banInfo.isBanned = false;
    this.banInfo.banDate = null;
    this.banInfo.banReason = null;
  }

  static createUser(
    UserModel: UserModelType,
    userInputDto: UserInputDto,
    hash: string,
    emailData?: UserEmailSchema,
  ): UserDocument {
    const user = {
      accountData: {
        login: userInputDto.login,
        passwordHash: hash,
        email: userInputDto.email,
        createdAt: new Date(),
        isMembership: false,
      },
      emailConfirmation: {
        confirmationCode: emailData?.confirmationCode ?? null,
        expirationDate: emailData?.expirationDate ?? null,
        isConfirmed: emailData?.isConfirmed ?? true,
      },
      passwordRecovery: {
        recoveryCode: null,
        expirationDate: null,
      },
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
      bansForBlogs: [],
    };
    return new UserModel(user);
  }
}

export const UserSchema = SchemaFactory.createForClass(UserMongoose);

UserSchema.methods = {
  userCanBeConfirmed: UserMongoose.prototype.userCanBeConfirmed,
  confirmUser: UserMongoose.prototype.confirmUser,
  updateEmailConfirmationData:
    UserMongoose.prototype.updateEmailConfirmationData,
  updatePasswordRecoveryData: UserMongoose.prototype.updatePasswordRecoveryData,
  passwordCanBeUpdated: UserMongoose.prototype.passwordCanBeUpdated,
  updatePassword: UserMongoose.prototype.updatePassword,
  saBanUser: UserMongoose.prototype.saBanUser,
  saUnbanUser: UserMongoose.prototype.saUnbanUser,
};

const userStaticMethods: UserModelStaticType = {
  createUser: UserMongoose.createUser,
};

UserSchema.statics = userStaticMethods;
