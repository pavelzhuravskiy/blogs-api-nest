import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtBearerGuard } from '../_auth/guards/jwt-bearer.guard';
import { UserIdFromGuard } from '../_auth/decorators/user-id-from-guard.decorator';
import { ResultCode } from '../../enums/result-code.enum';
import { exceptionHandler } from '../../exceptions/exception.handler';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { TelegramBotGetAuthLinkQuery } from './application/use-cases/telegram-bot-get-auth-link.use-case';
import {
  userIDField,
  userNotFound,
} from '../../exceptions/exception.constants';
import { TelegramAddToNotificationsWhitelistCommand } from './application/use-cases/telegram-add-to-notifications-whitelist.case';

@Controller('integrations/telegram')
export class IntegrationsTelegramController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  @Post('webhook')
  @HttpCode(204)
  async setWebhook(@Body() payload: any) {
    console.log(payload);
    if (!payload.message) {
      return;
    }

    if (payload.message.text.includes('/start')) {
      return this.commandBus.execute(
        new TelegramAddToNotificationsWhitelistCommand(
          payload.message.from.id,
          payload.message.text,
        ),
      );
    }
    return;
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
