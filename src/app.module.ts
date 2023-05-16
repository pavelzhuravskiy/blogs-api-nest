import { ConfigModule } from '@nestjs/config';
export const configModule = ConfigModule.forRoot();
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MainModule } from './common/modules/main.module';
import { TestingModule } from './testing/testing.module';
import { MailModule } from './mail/mail.module';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    configModule,
    MongooseModule.forRoot(process.env.MONGO_URI || 'local connection'),
    AuthModule,
    MainModule,
    TestingModule,
    UsersModule,
    MailModule,
    CqrsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
