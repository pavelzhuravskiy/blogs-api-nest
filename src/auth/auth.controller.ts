import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { UsersRepository } from '../users/users.repository';
import { CurrentUserId } from './decorators/current-user-id.param.decorator';
import { DevicesService } from '../devices/devices.service';
import { JwtService } from '@nestjs/jwt';
import { JwtBearerGuard } from './guards/jwt-bearer.guard';
import { MailService } from '../mail/mail.service';
import { UserCreateDto } from '../users/dto/user-create.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private devicesService: DevicesService,
    private mailService: MailService,
    private usersRepository: UsersRepository,
  ) {}

  @Post('send')
  async sendEmail(@Body() createUserDto: UserCreateDto) {
    return await this.mailService.sendMail(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('login')
  async login(@Request() req, @Response() res) {
    const userId = req.user.id;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'] || 'unknown';

    const tokens = await this.authService.getTokens(userId);

    await this.devicesService.createDevice(tokens.refreshToken, ip, userAgent);

    res
      .cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .json({ accessToken: tokens.accessToken });
  }

  @UseGuards(JwtRefreshGuard)
  @HttpCode(200)
  @Post('refresh-token')
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
      .json({ accessToken: tokens.accessToken });
  }

  @UseGuards(JwtBearerGuard)
  @Post('logout')
  @HttpCode(204)
  async logout(@Request() req) {
    const token = req.cookies.refreshToken;
    const decodedToken: any = await this.jwtService.decode(token);
    const deviceId = decodedToken?.deviceId;
    return this.devicesService.logout(deviceId);
  }

  @UseGuards(JwtBearerGuard)
  @Get('me')
  async getProfile(@CurrentUserId() currentUserId) {
    const user = await this.usersRepository.findUserById(currentUserId);

    return {
      email: user?.accountData.email,
      login: user?.accountData.login,
      id: currentUserId,
    };
  }
}
