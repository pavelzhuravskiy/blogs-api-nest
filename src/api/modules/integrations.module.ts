import { Module } from '@nestjs/common';
import { IntegrationsTelegramController } from '../_integrations/integrations.telegram.controller';

@Module({
  controllers: [IntegrationsTelegramController],
})
export class IntegrationsModule {}
