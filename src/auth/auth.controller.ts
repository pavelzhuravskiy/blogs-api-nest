import {
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { UsersRepository } from '../users/users.repository';
import { CurrentUserId } from './decorators/current-user-id.param.decorator';
import { DevicesService } from '../devices/devices.service';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';

@Controller()
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private devicesService: DevicesService,
    private usersRepository: UsersRepository,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req, @Response() res) {
    const userId = req.user.id;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'] || 'unknown';

    const deviceId = randomUUID();
    const tokens = await this.authService.getTokens(userId, deviceId);

    await this.devicesService.createDevice(tokens.refreshToken, ip, userAgent);

    res
      .cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .status(200)
      .json({ accessToken: tokens.accessToken });
  }

  @UseGuards(JwtAuthGuard)
  @Post('auth/refresh-token')
  async refreshTokens(@Request() req, @Response() res) {
    const userId = req.user.id;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'] || 'unknown';
    const token = req.cookies.refreshToken;

    const decodedToken: any = await this.jwtService.decode(token);
    const deviceId = decodedToken?.deviceId;
    const tokens = await this.authService.getTokens(userId, deviceId);
    const newToken = await this.jwtService.decode(tokens.refreshToken);

    await this.devicesService.updateDevice(newToken, ip, userAgent);

    res
      .cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .status(200)
      .json({ accessToken: tokens.accessToken });
  }

  @UseGuards(JwtAuthGuard)
  @Post('auth/logout')
  @HttpCode(204)
  async logout(@Request() req) {
    const token = req.cookies.refreshToken;
    const decodedToken: any = await this.jwtService.decode(token);
    const deviceId = decodedToken?.deviceId;
    return this.devicesService.deleteDevice(deviceId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('auth/me')
  async getProfile(@CurrentUserId() currentUserId) {
    // console.log(currentUserId);
    const user = await this.usersRepository.findUserById(currentUserId);
    return user;
  }
}
