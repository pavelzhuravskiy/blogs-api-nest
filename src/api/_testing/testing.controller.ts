import { Controller, Delete, HttpCode, Post, UseGuards } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BasicAuthGuard } from '../_auth/guards/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { MockTelegramIdCommand } from './application/use-cases/mock-telegram-id.use-case';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Post('mock-telegram-id')
  async mockTelegramId() {
    await this.commandBus.execute(new MockTelegramIdCommand());
  }

  @Delete('all-data')
  @HttpCode(204)
  async deleteAll() {
    return this.dataSource.query(`SELECT truncate_tables('pavelzhuravskiy');`);
  }
}
