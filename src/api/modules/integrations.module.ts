import { Module } from '@nestjs/common';
import { IntegrationsTelegramController } from '../_integrations/integrations.telegram.controller';
import { TelegramAdapter } from '../infrastructure/telegram/telegram.adapter';
import { TelegramBotGetAuthLinkUseCase } from '../_integrations/application/use-cases/telegram-bot-get-auth-link.use-case';
import { DataSourceRepository } from '../infrastructure/repositories/common/data-source.repository';
import { UsersRepository } from '../infrastructure/repositories/users/users.repository';
import { UsersModule } from './users.module';
import { CqrsModule } from '@nestjs/cqrs';
import { MainModule } from './main.module';

const controllers = [IntegrationsTelegramController];
const adapters = [TelegramAdapter];
const useCases = [TelegramBotGetAuthLinkUseCase];
const repositories = [DataSourceRepository, UsersRepository];

@Module({
  imports: [UsersModule, MainModule, CqrsModule],
  controllers: [...controllers],
  providers: [...adapters, ...useCases, ...repositories],
})
export class IntegrationsModule {}
