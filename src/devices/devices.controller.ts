import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtBearerGuard } from '../auth/guards/jwt-bearer.guard';
import { DevicesQueryRepository } from './devices.query.repository';
import { DevicesService } from './devices.service';
import { DevicesRepository } from './devices.repository';
import { exceptionHandler } from '../exceptions/exception.handler';
import { ExceptionCode } from '../exceptions/exception-codes.enum';
import { CurrentUserId } from '../auth/decorators/current-user-id.param.decorator';

@Controller('security')
export class DevicesController {
  constructor(
    private devicesService: DevicesService,
    private devicesRepository: DevicesRepository,
    private devicesQueryRepository: DevicesQueryRepository,
    private jwtService: JwtService,
  ) {}

  @UseGuards(JwtBearerGuard)
  @Get('devices')
  async getDevices(@Request() req) {
    const token = req.cookies.refreshToken;
    const decodedToken = await this.jwtService.decode(token);
    const userId = decodedToken?.sub;
    return this.devicesQueryRepository.findDevices(userId);
  }

  @UseGuards(JwtBearerGuard)
  @Delete('devices')
  @HttpCode(204)
  async deleteOldDevices(@Request() req) {
    const token = req.cookies.refreshToken;
    const decodedToken: any = await this.jwtService.decode(token);
    const deviceId = decodedToken?.deviceId;
    return this.devicesService.deleteOldDevices(deviceId);
  }

  @UseGuards(JwtBearerGuard)
  @Delete('devices/:id')
  @HttpCode(204)
  async terminateSession(
    @CurrentUserId() currentUserId,
    @Param('id') deviceId: string,
  ) {
    const result = await this.devicesService.terminateSession(
      currentUserId,
      deviceId,
    );

    if (result.code !== ExceptionCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }
}
