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
import { UsersRepository } from '../users/infrastructure/users.repository';
import { UserIdFromGuard } from './decorators/user-id-from-guard.decorator';
import { DevicesService } from '../devices/devices.service';
import { JwtService } from '@nestjs/jwt';
import { JwtBearerGuard } from './guards/jwt-bearer.guard';
import { UserInputDto } from '../users/dto/user-input.dto';
import { ConfirmCodeInputDto } from './dto/confirm-code.input.dto';
import { exceptionHandler } from '../exceptions/exception.handler';
import { ResultCode } from '../exceptions/exception-codes.enum';
import {
  confirmCodeField,
  confirmCodeIsIncorrect,
  emailField,
  recoveryCodeIsIncorrect,
  recoveryCodeField,
  userNotFoundOrConfirmed,
} from '../exceptions/exception.constants';
import { EmailInputDto } from './dto/email.input.dto';
import { NewPasswordInputDto } from './dto/new-password.input.dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { RefreshToken } from './decorators/refresh-token.decorator';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from './application/use-cases/registration/reg.register-user.use-case';
import { ResendEmailCommand } from './application/use-cases/registration/reg.resend-email.use-case';
import { ConfirmUserCommand } from './application/use-cases/registration/reg.confirm-user.use-case';
import { RecoverPasswordCommand } from './application/use-cases/password-recovery/pass.recover.use-case';
import { UpdatePasswordCommand } from './application/use-cases/password-recovery/pass.update.use-case';

@Controller('auth')
export class PublicAuthController {
  constructor(
    private commandBus: CommandBus,
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
    return this.commandBus.execute(new RegisterUserCommand(userInputDto));
  }

  @UseGuards(ThrottlerGuard)
  @Throttle(5, 10)
  @Post('registration-email-resending')
  @HttpCode(204)
  async resendEmail(@Body() emailInputDto: EmailInputDto) {
    const result = await this.commandBus.execute(
      new ResendEmailCommand(emailInputDto),
    );

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
  async confirmUser(@Body() confirmCodeInputDto: ConfirmCodeInputDto) {
    const result = await this.commandBus.execute(
      new ConfirmUserCommand(confirmCodeInputDto),
    );

    if (!result) {
      return exceptionHandler(
        ResultCode.BadRequest,
        confirmCodeIsIncorrect,
        confirmCodeField,
      );
    }

    return result;
  }

  @UseGuards(ThrottlerGuard)
  @Throttle(5, 10)
  @Post('password-recovery')
  @HttpCode(204)
  async recoverPassword(@Body() emailInputDto: EmailInputDto) {
    return this.commandBus.execute(new RecoverPasswordCommand(emailInputDto));
  }

  @UseGuards(ThrottlerGuard)
  @Throttle(5, 10)
  @Post('new-password')
  @HttpCode(204)
  async updatePassword(@Body() newPasswordDto: NewPasswordInputDto) {
    const result = await this.commandBus.execute(
      new UpdatePasswordCommand(newPasswordDto),
    );

    if (!result) {
      return exceptionHandler(
        ResultCode.BadRequest,
        recoveryCodeIsIncorrect,
        recoveryCodeField,
      );
    }

    return result;
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
