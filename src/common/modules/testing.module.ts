import { Module } from '@nestjs/common';
import { TestingController } from '../../testing/testing.controller';
import { UsersModule } from '../../users/users.module';
import { BloggersModule } from './bloggers.module';

@Module({
  imports: [BloggersModule, UsersModule],
  controllers: [TestingController],
})
export class TestingModule {}
