import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../users/users.repository';
import bcrypt from 'bcrypt';
import { jwtConstants } from './constants';
import { DevicesService } from '../devices/devices.service';
import { DevicesRepository } from '../devices/devices.repository';
import { DeviceDocument } from '../devices/schemas/device.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private devicesService: DevicesService,
    private usersRepository: UsersRepository,
    private devicesRepository: DevicesRepository,
  ) {}

  async validateUser(loginOrEmail: string, password: string): Promise<any> {
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
    console.log(device);

    if (!device || payload.iat < device.lastActiveDate) {
      return null;
    }

    return device;
  }

  async getTokens(req: any, deviceId: string) {
    const accessTokenPayload = { sub: req.user.id };
    const refreshTokenPayload = { sub: req.user.id, deviceId: deviceId };

    const accessToken = this.jwtService.sign(accessTokenPayload, {
      secret: jwtConstants.accessTokenSecret,
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: jwtConstants.refreshTokenSecret,
      expiresIn: '2h',
    });

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
}
