import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MailerService } from '@nestjs-modules/mailer';

export class SendPasswordRecoveryMailCommand {
  constructor(
    public login: string,
    public email: string,
    public recoveryCode: string,
  ) {}
}

@CommandHandler(SendPasswordRecoveryMailCommand)
export class SendPasswordRecoveryUseCase
  implements ICommandHandler<SendPasswordRecoveryMailCommand>
{
  constructor(private mailerService: MailerService) {}

  async execute(command: SendPasswordRecoveryMailCommand) {
    const url = `https://somesite.com/password-recovery?recoveryCode=${command.recoveryCode}`;

    await this.mailerService.sendMail({
      to: command.email,
      subject: 'Password recovery',
      template: './password-recovery', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        login: command.login,
        url,
      },
    });
  }
}
