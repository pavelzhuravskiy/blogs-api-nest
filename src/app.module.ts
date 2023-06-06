import { ConfigModule } from '@nestjs/config';
export const configModule = ConfigModule.forRoot();
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './api/_auth/auth.module';
import { UsersModule } from './api/modules/users.module';
import { MainModule } from './api/modules/main.module';
import { TestingModule } from './api/modules/testing.module';
import { MailModule } from './mail/mail.module';
import { CqrsModule } from '@nestjs/cqrs';
import { DevicesModule } from './api/modules/devices.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as process from 'process';

@Module({
  imports: [
    configModule,
    MongooseModule.forRoot(process.env.MONGO_URI || ''),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PGHOST,
      port: 5432,
      username: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      autoLoadEntities: false,
      synchronize: false,
      ssl: true,
    }),
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
