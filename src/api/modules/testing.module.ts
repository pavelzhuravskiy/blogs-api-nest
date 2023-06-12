import { Module } from '@nestjs/common';
import { TestingController } from '../_testing/testing.controller';

@Module({
  controllers: [TestingController],
})
export class TestingModule {}
