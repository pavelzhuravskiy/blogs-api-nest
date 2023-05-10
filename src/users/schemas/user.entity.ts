import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { UserAccountSchema } from './user-account.schema';
import { UserEmailSchema } from './user-email.schema';
import { UserPasswordSchema } from './user-password.schema';
import { UserCreateDto } from '../dto/user-create.dto';
import { add } from 'date-fns';

export type UserDocument = HydratedDocument<User>;

export type UserModelStaticType = {
  createUser: (
    createUserDto: UserCreateDto,
    UserModel: UserModelType,
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
    createUserDto: UserCreateDto,
    UserModel: UserModelType,
    hash: string,
    emailData?: UserEmailSchema,
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
        confirmationCode: emailData?.confirmationCode ?? null,
        expirationDate: emailData?.expirationDate ?? null,
        isConfirmed: emailData?.isConfirmed ?? true,
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

UserSchema.methods = {
  userCanBeConfirmed: User.prototype.userCanBeConfirmed,
  confirmUser: User.prototype.confirmUser,
  updateConfirmationData: User.prototype.updateEmailConfirmationData,
  updatePasswordRecoveryData: User.prototype.updatePasswordRecoveryData,
  passwordCanBeUpdated: User.prototype.passwordCanBeUpdated,
  updatePassword: User.prototype.updatePassword,
};

const userStaticMethods: UserModelStaticType = {
  createUser: User.createUser,
};

UserSchema.statics = userStaticMethods;
