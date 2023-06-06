import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from '../config/constants';
import { cookieExtractor } from '../utils/cookie-extractor';
import { ValidateRefreshTokenCommand } from '../application/use-cases/validations/validate-refresh-token.use-case';
import { CommandBus } from '@nestjs/cqrs';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh',
) {
  constructor(private commandBus: CommandBus) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: jwtConstants.refreshTokenSecret,
    });
  }

  async validate(payload: any) {
    const result = await this.commandBus.execute(
      new ValidateRefreshTokenCommand(payload),
    );

    if (!result) {
      throw new UnauthorizedException();
    }

    return {
      id: payload.sub,
    };
  }
}
