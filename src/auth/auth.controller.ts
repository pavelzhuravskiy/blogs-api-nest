import {
  Controller,
  Get,
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

@Controller()
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersRepository: UsersRepository,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req, @Response() res) {
    const login = await this.authService.login(req);
    res
      .cookie('refreshToken', login.refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .status(200)
      .json({ accessToken: login.accessToken });
  }

  @UseGuards(JwtAuthGuard)
  @Get('auth/me')
  async getProfile(@CurrentUserId() currentUserId) {
    // console.log(currentUserId);
    const user = await this.usersRepository.findUserById(currentUserId);
    return user;
  }
}
