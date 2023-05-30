import { ConfigModule } from '@nestjs/config';
export const configModule = ConfigModule.forRoot();
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './api/modules/users.module';
import { MainModule } from './api/modules/main.module';
import { TestingModule } from './api/modules/testing.module';
import { MailModule } from './mail/mail.module';
import { CqrsModule } from '@nestjs/cqrs';
import { DevicesModule } from './api/modules/devices.module';

@Module({
  imports: [
    configModule,
    MongooseModule.forRoot(process.env.MONGO_URI || 'local connection'),
    CqrsModule,
    AuthModule,
    DevicesModule,
    MainModule,
    UsersModule,
    MailModule,
    TestingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
