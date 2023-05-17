import { ConfigModule } from '@nestjs/config';
export const configModule = ConfigModule.forRoot();
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './features/auth/auth.module';
import { UsersModule } from './features/users/users.module';
import { MainModule } from './features/_shared/modules/main.module';
import { TestingModule } from './features/testing/testing.module';
import { MailModule } from './features/mail/mail.module';
import { CqrsModule } from '@nestjs/cqrs';
import { DevicesModule } from './features/devices/devices.module';

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
