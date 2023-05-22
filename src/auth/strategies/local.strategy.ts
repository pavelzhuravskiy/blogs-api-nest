import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ValidateLoginAndPasswordCommand } from '../application/use-cases/validations/validate-login-pass.use-case';
import { CommandBus } from '@nestjs/cqrs';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private commandBus: CommandBus) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(loginOrEmail: string, password: string): Promise<any> {
    const user = await this.commandBus.execute(
      new ValidateLoginAndPasswordCommand(loginOrEmail, password),
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
