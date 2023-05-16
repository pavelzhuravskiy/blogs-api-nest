import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../users/infrastructure/users.repository';
import bcrypt from 'bcrypt';
import { jwtConstants } from './constants';
import { DevicesService } from '../devices/devices.service';
import { DevicesRepository } from '../devices/devices.repository';
import { DeviceDocument } from '../devices/schemas/device.entity';
import { UserDocument } from '../users/user.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly devicesService: DevicesService,
    private readonly usersRepository: UsersRepository,
    private readonly devicesRepository: DevicesRepository,
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
}
