import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../users/users.repository';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { jwtConstants } from './constants';
import { DevicesService } from '../devices/devices.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private devicesService: DevicesService,
    private usersRepository: UsersRepository,
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

  async login(req: any) {
    const ip = req.ip;
    const userAgent = req.headers['user-agent'] || 'unknown';
    const deviceId = randomUUID();

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

    await this.devicesService.createDevice(refreshToken, ip, userAgent);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
}
