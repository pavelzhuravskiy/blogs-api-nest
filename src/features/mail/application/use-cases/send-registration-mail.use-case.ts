import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MailerService } from '@nestjs-modules/mailer';

export class SendRegistrationMailCommand {
  constructor(
    public login: string,
    public email: string,
    public confirmationCode: string,
  ) {}
}

@CommandHandler(SendRegistrationMailCommand)
export class SendRegistrationMailUseCase
  implements ICommandHandler<SendRegistrationMailCommand>
{
  constructor(private mailerService: MailerService) {}

  async execute(command: SendRegistrationMailCommand) {
    const url = `https://somesite.com/confirm-email?code=${command.confirmationCode}`;

    await this.mailerService.sendMail({
      to: command.email,
      subject: 'Registration confirmation',
      template: './confirmation', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        login: command.login,
        url,
      },
    });
  }
}
