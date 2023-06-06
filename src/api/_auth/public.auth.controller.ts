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
import { UsersMongooseRepository } from '../infrastructure/_mongoose/users/users.mongoose.repository';
import { UserIdFromGuard } from './decorators/user-id-from-guard.decorator';
import { JwtService } from '@nestjs/jwt';
import { JwtBearerGuard } from './guards/jwt-bearer.guard';
import { UserInputDto } from '../dto/users/input/user-input.dto';
import { ConfirmCodeInputDto } from './dto/confirm-code.input.dto';
import { exceptionHandler } from '../../exceptions/exception.handler';
import { ResultCode } from '../../enums/result-code.enum';
import {
  confirmCodeField,
  confirmCodeIsIncorrect,
  emailField,
  recoveryCodeField,
  recoveryCodeIsIncorrect,
  userIDField,
  userNotFound,
  userNotFoundOrConfirmed,
} from '../../exceptions/exception.constants';
import { EmailInputDto } from './dto/email.input.dto';
import { NewPasswordInputDto } from './dto/new-password.input.dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { RefreshToken } from './decorators/refresh-token.decorator';
import { CommandBus } from '@nestjs/cqrs';
import { RegistrationCommand } from './application/use-cases/registration/registration.use-case';
import { RegistrationEmailResendCommand } from './application/use-cases/registration/registration-email-resend.use-case';
import { RegistrationConfirmationCommand } from './application/use-cases/registration/registration-confirmation.use-case';
import { PasswordRecoveryCommand } from './application/use-cases/password/password-recovery.use-case';
import { PasswordUpdateCommand } from './application/use-cases/password/password-update.use-case';
import { DeviceCreateForLoginCommand } from './application/use-cases/devices/device-create-for-login.use-case';
import { DeviceUpdateForTokensCommand } from './application/use-cases/devices/device-update-for-tokens.use-case';
import { DeviceDeleteForLogoutCommand } from './application/use-cases/devices/device-delete-for-logout.use-case';
import { TokensCreateCommand } from './application/use-cases/tokens/tokens-create.use-case';

@Controller('auth')
export class PublicAuthController {
  constructor(
    private commandBus: CommandBus,
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersMongooseRepository,
  ) {}

  // @UseGuards(ThrottlerGuard)
  // @Throttle(5, 10)
  @Post('registration')
  @HttpCode(204)
  async registerUser(@Body() userInputDto: UserInputDto) {
    return this.commandBus.execute(new RegistrationCommand(userInputDto));
  }

  // @UseGuards(ThrottlerGuard)
  // @Throttle(5, 10)
  @Post('registration-email-resending')
  @HttpCode(204)
  async resendEmail(@Body() emailInputDto: EmailInputDto) {
    const result = await this.commandBus.execute(
      new RegistrationEmailResendCommand(emailInputDto),
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

  // @UseGuards(ThrottlerGuard)
  // @Throttle(5, 10)
  @Post('registration-confirmation')
  @HttpCode(204)
  async confirmUser(@Body() confirmCodeInputDto: ConfirmCodeInputDto) {
    const result = await this.commandBus.execute(
      new RegistrationConfirmationCommand(confirmCodeInputDto),
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

  // @UseGuards(ThrottlerGuard)
  // @Throttle(5, 10)
  @Post('password-recovery')
  @HttpCode(204)
  async recoverPassword(@Body() emailInputDto: EmailInputDto) {
    return this.commandBus.execute(new PasswordRecoveryCommand(emailInputDto));
  }

  // @UseGuards(ThrottlerGuard)
  // @Throttle(5, 10)
  @Post('new-password')
  @HttpCode(204)
  async updatePassword(@Body() newPasswordDto: NewPasswordInputDto) {
    const result = await this.commandBus.execute(
      new PasswordUpdateCommand(newPasswordDto),
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

  @UseGuards(/*ThrottlerGuard, */ LocalAuthGuard)
  // @Throttle(5, 10)
  @Post('login')
  @HttpCode(200)
  async login(
    @UserIdFromGuard() userId,
    @Ip() ip,
    @Headers() headers,
    @Response() res,
  ) {
    const userAgent = headers['user-agent'] || 'unknown';
    const tokens = await this.commandBus.execute(
      new TokensCreateCommand(userId),
    );

    await this.commandBus.execute(
      new DeviceCreateForLoginCommand(tokens.refreshToken, ip, userAgent),
    );

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

    const tokens = await this.commandBus.execute(
      new TokensCreateCommand(userId, deviceId),
    );

    const newToken = this.jwtService.decode(tokens.refreshToken);

    await this.commandBus.execute(
      new DeviceUpdateForTokensCommand(newToken, ip, userAgent),
    );

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
    return this.commandBus.execute(new DeviceDeleteForLogoutCommand(deviceId));
  }

  @UseGuards(JwtBearerGuard)
  @Get('me')
  async getProfile(@UserIdFromGuard() userId) {
    const user = await this.usersRepository.findUserById(userId);

    if (!user) {
      return exceptionHandler(ResultCode.NotFound, userNotFound, userIDField);
    }

    return {
      email: user?.accountData.email,
      login: user?.accountData.login,
      userId: userId,
    };
  }
}
