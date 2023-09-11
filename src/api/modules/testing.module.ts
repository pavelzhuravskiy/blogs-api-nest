import { Module } from '@nestjs/common';
import { TestingController } from '../_testing/testing.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { MockTelegramIdUseCase } from '../_testing/application/use-cases/mock-telegram-id.use-case';
import { DataSourceRepository } from '../infrastructure/repositories/common/data-source.repository';
import { MainModule } from './main.module';

const useCases = [MockTelegramIdUseCase];
const repositories = [DataSourceRepository];

@Module({
  imports: [MainModule, CqrsModule],
  providers: [...useCases, ...repositories],
  controllers: [TestingController],
})
export class TestingModule {}
