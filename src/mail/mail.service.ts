import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendRegistrationMail(
    login: string,
    email: string,
    confirmationCode: string,
  ) {
    const url = `https://somesite.com/confirm-email?code=${confirmationCode}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Registration confirmation',
      template: './confirmation', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        login: login,
        url,
      },
    });
  }
}
