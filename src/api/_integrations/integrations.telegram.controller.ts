import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import axios from 'axios';
import process from 'process';

@Controller('api/integrations/telegram')
export class IntegrationsTelegramController {
  constructor(/*private commandBus: CommandBus*/) {}

  @Post('webhook')
  @HttpCode(204)
  async telegramWebhook(@Body() payload: any) {
    await axios.post(process.env.TELEGRAM_WEBHOOK_URL, {
      url: process.env.TELEGRAM_MY_WEBHOOK_URL,
    });
    // console.log(payload);
    return { status: 'success' };
  }
}
