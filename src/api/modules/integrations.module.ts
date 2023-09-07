import { Module } from '@nestjs/common';
import { IntegrationsTelegramController } from '../_integrations/integrations.telegram.controller';
import { TelegramAdapter } from '../infrastructure/telegram/telegram.adapter';

@Module({
  controllers: [IntegrationsTelegramController],
  providers: [TelegramAdapter],
})
export class IntegrationsModule {}
