import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { TelegramAdapter } from '../infrastructure/telegram/telegram.adapter';

@Controller('api/integrations/telegram')
export class IntegrationsTelegramController {
  constructor(private telegramAdapter: TelegramAdapter) {}

  @Post('webhook')
  @HttpCode(204)
  async telegramWebhook(@Body() payload: any) {
    await this.telegramAdapter.setWebhook();
    console.log(payload);
    return { status: 'success' };
  }
}
