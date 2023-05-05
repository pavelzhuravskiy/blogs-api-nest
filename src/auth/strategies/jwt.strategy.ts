import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from '../constants';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'Strategy name') { // TODO
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.refreshTokenSecret,
    });
  }

  async validate(payload: any) {
    const result = await this.authService.validateRefreshToken(payload);

    if (!result) {
      throw new UnauthorizedException();
    }

    return {
      id: payload.sub,
    };
  }
}
