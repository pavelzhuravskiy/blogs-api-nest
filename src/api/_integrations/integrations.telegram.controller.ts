import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TelegramAdapter } from '../infrastructure/telegram/telegram.adapter';
import { JwtBearerGuard } from '../_auth/guards/jwt-bearer.guard';
import { UserIdFromGuard } from '../_auth/decorators/user-id-from-guard.decorator';
import { ResultCode } from '../../enums/result-code.enum';
import { exceptionHandler } from '../../exceptions/exception.handler';
import { QueryBus } from '@nestjs/cqrs';
import { TelegramBotGetAuthLinkQuery } from './application/use-cases/telegram-bot-get-auth-link.use-case';
import {
  userIDField,
  userNotFound,
} from '../../exceptions/exception.constants';

@Controller('integrations/telegram')
export class IntegrationsTelegramController {
  constructor(
    private telegramAdapter: TelegramAdapter,
    private queryBus: QueryBus,
  ) {}

  @Post('webhook')
  @HttpCode(204)
  async setWebhook(@Body() payload: any) {
    await this.telegramAdapter.setWebhook();
    console.log(payload);
    return { status: 'success' };
  }

  @UseGuards(JwtBearerGuard)
  @Get('auth-bot-link')
  async getBotLink(@UserIdFromGuard() userId: string) {
    const result = await this.queryBus.execute(
      new TelegramBotGetAuthLinkQuery(userId),
    );

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, userNotFound, userIDField);
    }

    return result;
  }
}
