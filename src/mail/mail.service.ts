import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { UserCreateDto } from '../users/dto/user-create.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendMail(createUserDto: UserCreateDto) {
    await this.mailerService.sendMail({
      to: createUserDto.email,
      subject: 'Greeting from NestJS NodeMailer',
      template: 'src/mail/templates/email',
      context: {
        name: randomUUID(),
      },
    });
  }
}
