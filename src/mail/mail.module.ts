import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { join } from 'path';
import { SendRegistrationMailUseCase } from './application/use-cases/send-registration-mail.use-case';
import { SendPasswordRecoveryUseCase } from './application/use-cases/send-pass-recovery-mail.use-case';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        port: 465,
        host: 'smtp.gmail.com',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
        secure: true,
      },
      defaults: {
        from: '"Admin" <process.env.EMAIL>',
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [SendRegistrationMailUseCase, SendPasswordRecoveryUseCase],
})
export class MailModule {}
