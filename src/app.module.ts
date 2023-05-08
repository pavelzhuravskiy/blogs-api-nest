import { ConfigModule } from '@nestjs/config';
export const configModule = ConfigModule.forRoot();
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BloggersModule } from './common/modules/bloggers.module';
import { TestingModule } from './testing/testing.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './mail/mail.service';

@Module({
  imports: [
    configModule,
    MailerModule.forRootAsync({
      useFactory: async () => ({
        transport: {
          host: 'smtp.gmail.com',
          secure: true,
          port: 465,
          auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
          },
        },
        defaults: {
          from: '"Admin" <process.env.EMAIL>',
        },
        template: {
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    MongooseModule.forRoot(process.env.MONGO_URI || 'local connection'),
    AuthModule,
    BloggersModule,
    TestingModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule {}
