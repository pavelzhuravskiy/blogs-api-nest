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
import { CurrentUserId } from '../auth/decorators/current-user-id.param.decorator';
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
  async getDevices(@CurrentUserId() currentUserId) {
    return this.devicesQueryRepository.findDevices(currentUserId);
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
  async terminateSession(
    @CurrentUserId() currentUserId,
    @Param('id') deviceId,
  ) {
    const result = await this.devicesService.terminateSession(
      currentUserId,
      deviceId,
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }
}
