import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../users/users.repository';
import bcrypt from 'bcrypt';
import { jwtConstants } from './constants';
import { DevicesService } from '../devices/devices.service';
import { DevicesRepository } from '../devices/devices.repository';
import { DeviceDocument } from '../devices/schemas/device.entity';
import {
  User,
  UserDocument,
  UserModelType,
} from '../users/schemas/user.entity';
import { randomUUID } from 'crypto';
import { UserCreateDto } from '../users/dto/user-create.dto';
import { UserViewModel } from '../users/schemas/user.view';
import { add } from 'date-fns';
import { InjectModel } from '@nestjs/mongoose';
import { MailService } from '../mail/mail.service';
import { UserConfirmDto } from './dto/user-confirm.dto';
import { EmailResendDto } from './dto/email-resend.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private mailService: MailService,
    private jwtService: JwtService,
    private devicesService: DevicesService,
    private usersRepository: UsersRepository,
    private devicesRepository: DevicesRepository,
  ) {}

  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      loginOrEmail,
    );

    if (!user || !user.emailConfirmation.isConfirmed) {
      return null;
    }

    const result = await bcrypt.compare(
      password,
      user.accountData.passwordHash,
    );

    if (result) {
      return user;
    }

    return null;
  }

  async validateRefreshToken(payload: any): Promise<DeviceDocument | null> {
    const device = await this.devicesRepository.findDevice(payload.deviceId);

    if (!device || payload.iat < device.lastActiveDate) {
      return null;
    }

    return device;
  }

  async getTokens(userId: string, deviceId: string = randomUUID()) {
    const accessTokenPayload = { sub: userId };
    const refreshTokenPayload = { sub: userId, deviceId: deviceId };

    const accessToken = this.jwtService.sign(accessTokenPayload, {
      secret: jwtConstants.accessTokenSecret,
      expiresIn: jwtConstants.accessTokenExpirationTime,
    });

    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: jwtConstants.refreshTokenSecret,
      expiresIn: jwtConstants.refreshTokenExpirationTime,
    });

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async registerUser(
    createUserDto: UserCreateDto,
  ): Promise<UserViewModel | null> {
    const hash = await bcrypt.hash(
      createUserDto.password,
      Number(process.env.HASH_ROUNDS),
    );
    const emailData = {
      confirmationCode: randomUUID(),
      expirationDate: add(new Date(), { hours: 1 }),
      isConfirmed: false,
    };
    const user = this.UserModel.createUser(
      createUserDto,
      this.UserModel,
      hash,
      emailData,
    );

    const result = await this.usersRepository.createUser(user);

    try {
      await this.mailService.sendRegistrationMail(
        createUserDto,
        emailData.confirmationCode,
      );
    } catch (error) {
      console.error(error);
      await this.usersRepository.deleteUser(user.id);
      return null;
    }

    return result;
  }

  async confirmUser(
    userConfirmDto: UserConfirmDto,
  ): Promise<UserDocument | null> {
    const user = await this.usersRepository.findUserByCode(userConfirmDto.code);

    if (!user || !user.canBeConfirmed()) {
      return null;
    }

    await user.confirm();
    return this.usersRepository.save(user);
  }

  async resendEmail(
    emailResendDto: EmailResendDto,
  ): Promise<UserDocument | null> {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      emailResendDto.email,
    );

    if (!user || user.emailConfirmation.isConfirmed) {
      return null;
    }

    await user.updateConfirmationData();
    return this.usersRepository.save(user);
  }
}
