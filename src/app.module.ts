import { ConfigModule } from '@nestjs/config';
export const configModule = ConfigModule.forRoot();
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './api/modules/auth.module';
import { UsersModule } from './api/modules/users.module';
import { MainModule } from './api/modules/main.module';
import { TestingModule } from './api/modules/testing.module';
import { CqrsModule } from '@nestjs/cqrs';
import { DevicesModule } from './api/modules/devices.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as process from 'process';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';
import { MailModule } from './api/infrastructure/mail/mail.module';
import { QuizModule } from './api/modules/quiz.module';
import { ScheduleModule } from '@nestjs/schedule';
import { IntegrationsModule } from './api/modules/integrations.module';

export const options: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.PGHOST,
  port: 5432,
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  autoLoadEntities: true,
  synchronize: true,
  ssl: true,
};

@Module({
  imports: [
    configModule,
    TypeOrmModule.forRoot(options),
    ScheduleModule.forRoot(),
    CqrsModule,
    AuthModule,
    DevicesModule,
    MainModule,
    UsersModule,
    MailModule,
    TestingModule,
    QuizModule,
    IntegrationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
