import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { UserAccountSchema } from './schemas/user-account.schema';
import { UserEmailSchema } from './schemas/user-email.schema';
import { UserPasswordSchema } from './schemas/user-password.schema';
import { UserInputDto } from './dto/user-input.dto';
import { add } from 'date-fns';
import { UserBanSchema } from './schemas/user-ban.schema';

export type UserDocument = HydratedDocument<User>;
export type UserLeanType = User & { _id: Types.ObjectId };

export type UserModelStaticType = {
  createUser: (
    UserModel: UserModelType,
    userInputDto: UserInputDto,
    hash: string,
    emailData?: UserEmailSchema,
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

  @Prop({ required: true })
  banInfo: UserBanSchema;

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
    };
    return new UserModel(user);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods = {
  userCanBeConfirmed: User.prototype.userCanBeConfirmed,
  confirmUser: User.prototype.confirmUser,
  updateEmailConfirmationData: User.prototype.updateEmailConfirmationData,
  updatePasswordRecoveryData: User.prototype.updatePasswordRecoveryData,
  passwordCanBeUpdated: User.prototype.passwordCanBeUpdated,
  updatePassword: User.prototype.updatePassword,
};

const userStaticMethods: UserModelStaticType = {
  createUser: User.createUser,
};

UserSchema.statics = userStaticMethods;
