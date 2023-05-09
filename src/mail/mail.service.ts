import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { UserCreateDto } from '../users/dto/user-create.dto';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendRegistrationMail(
    userCreateDto: UserCreateDto,
    confirmationCode: string,
  ) {
    const url = `https://somesite.com/confirm-email?code=${confirmationCode}`;

    await this.mailerService.sendMail({
      to: userCreateDto.email,
      subject: 'Registration confirmation',
      template: './confirmation', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        login: userCreateDto.login,
        url,
      },
    });
  }
}
