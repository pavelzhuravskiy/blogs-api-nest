import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Ip,
  Post,
  Response,
  UseGuards,
} from '@nestjs/common';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { UsersRepository } from '../users/users.repository';
import { UserIdFromGuard } from './decorators/user-id-from-guard.param.decorator';
import { DevicesService } from '../devices/devices.service';
import { JwtService } from '@nestjs/jwt';
import { JwtBearerGuard } from './guards/jwt-bearer.guard';
import { UserInputDto } from '../users/dto/user-input.dto';
import { UsersService } from '../users/users.service';
import { UserConfirmDto } from './dto/user-confirm.dto';
import { exceptionHandler } from '../exceptions/exception.handler';
import { ResultCode } from '../exceptions/exception-codes.enum';
import {
  codeField,
  codeIsIncorrect,
  emailField,
  userNotFoundOrConfirmed,
} from '../exceptions/exception.constants';
import { EmailDto } from './dto/email.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { RefreshToken } from './decorators/refresh-token.param.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly devicesService: DevicesService,
    private readonly usersRepository: UsersRepository,
  ) {}

  @UseGuards(ThrottlerGuard)
  @Throttle(5, 10)
  @Post('registration')
  @HttpCode(204)
  async registerUser(@Body() userInputDto: UserInputDto) {
    return this.authService.registerUser(userInputDto);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle(5, 10)
  @Post('registration-email-resending')
  @HttpCode(204)
  async resendEmail(@Body() emailDto: EmailDto) {
    const result = await this.authService.resendEmail(emailDto);

    if (!result) {
      return exceptionHandler(
        ResultCode.BadRequest,
        userNotFoundOrConfirmed,
        emailField,
      );
    }

    return result;
  }

  @UseGuards(ThrottlerGuard)
  @Throttle(5, 10)
  @Post('registration-confirmation')
  @HttpCode(204)
  async confirmUser(@Body() userConfirmDto: UserConfirmDto) {
    const result = await this.authService.confirmUser(userConfirmDto);

    if (!result) {
      return exceptionHandler(
        ResultCode.BadRequest,
        codeIsIncorrect,
        codeField,
      );
    }

    return result;
  }

  @UseGuards(ThrottlerGuard)
  @Throttle(5, 10)
  @Post('password-recovery')
  @HttpCode(204)
  async recoverPassword(@Body() emailDto: EmailDto) {
    return this.authService.recoverPassword(emailDto);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle(5, 10)
  @Post('new-password')
  @HttpCode(204)
  async updatePassword(@Body() newPasswordDto: NewPasswordDto) {
    return this.authService.updatePassword(newPasswordDto);
  }

  @UseGuards(ThrottlerGuard, LocalAuthGuard)
  @Throttle(5, 10)
  @Post('login')
  @HttpCode(200)
  async login(
    @UserIdFromGuard() userId,
    @Ip() ip,
    @Headers() headers,
    @Response() res,
  ) {
    const userAgent = headers['user-agent'] || 'unknown';
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
  @Post('refresh-token')
  @HttpCode(200)
  async refreshTokens(
    @UserIdFromGuard() userId,
    @Ip() ip,
    @Headers() headers,
    @RefreshToken() refreshToken,
    @Response() res,
  ) {
    const userAgent = headers['user-agent'] || 'unknown';
    const decodedToken: any = this.jwtService.decode(refreshToken);
    const deviceId = decodedToken.deviceId;
    const tokens = await this.authService.getTokens(userId, deviceId);
    const newToken = this.jwtService.decode(tokens.refreshToken);

    await this.devicesService.updateDevice(newToken, ip, userAgent);

    res
      .cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .json({ accessToken: tokens.accessToken });
  }

  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  @HttpCode(204)
  async logout(@RefreshToken() refreshToken) {
    const decodedToken: any = this.jwtService.decode(refreshToken);
    const deviceId = decodedToken.deviceId;
    return this.devicesService.logout(deviceId);
  }

  @UseGuards(JwtBearerGuard)
  @Get('me')
  async getProfile(@UserIdFromGuard() userId) {
    const user = await this.usersRepository.findUserById(userId);

    return {
      email: user?.accountData.email,
      login: user?.accountData.login,
      userId: userId,
    };
  }
}
