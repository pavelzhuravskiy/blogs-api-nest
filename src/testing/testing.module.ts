import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { UsersModule } from '../users/users.module';
import { BloggersModule } from '../common/bloggers.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [BloggersModule, UsersModule, AuthModule],
  controllers: [TestingController],
})
export class TestingModule {}
