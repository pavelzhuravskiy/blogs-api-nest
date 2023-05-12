import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DevicesQueryRepository } from './devices.query.repository';
import { DevicesService } from './devices.service';
import { DevicesRepository } from './devices.repository';
import { exceptionHandler } from '../exceptions/exception.handler';
import { ResultCode } from '../exceptions/exception-codes.enum';
import { UserIdFromGuard } from '../auth/decorators/user-id-from-guard.param.decorator';
import { JwtRefreshGuard } from '../auth/guards/jwt-refresh.guard';
import { RefreshToken } from '../auth/decorators/refresh-token.param.decorator';

@Controller('security')
export class DevicesController {
  constructor(
    private readonly devicesService: DevicesService,
    private readonly devicesRepository: DevicesRepository,
    private readonly devicesQueryRepository: DevicesQueryRepository,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(JwtRefreshGuard)
  @Get('devices')
  async getDevices(@UserIdFromGuard() userId) {
    return this.devicesQueryRepository.findDevices(userId);
  }

  @UseGuards(JwtRefreshGuard)
  @Delete('devices')
  @HttpCode(204)
  async deleteOldDevices(@RefreshToken() refreshToken) {
    const decodedToken: any = this.jwtService.decode(refreshToken);
    const deviceId = decodedToken?.deviceId;
    return this.devicesService.deleteOldDevices(deviceId);
  }

  @UseGuards(JwtRefreshGuard)
  @Delete('devices/:id')
  @HttpCode(204)
  async terminateSession(@UserIdFromGuard() userId, @Param('id') deviceId) {
    const result = await this.devicesService.terminateSession(userId, deviceId);

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }
}
