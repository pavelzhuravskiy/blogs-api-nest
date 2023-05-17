import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { jwtConstants } from '../../../../../config/constants';
import { JwtService } from '@nestjs/jwt';

export class TokensCreateCommand {
  constructor(public userId: string, public deviceId = randomUUID()) {}
}

@CommandHandler(TokensCreateCommand)
export class TokensCreateUseCase
  implements ICommandHandler<TokensCreateCommand>
{
  constructor(private readonly jwtService: JwtService) {}

  async execute(command: TokensCreateCommand) {
    const accessTokenPayload = { sub: command.userId };
    const refreshTokenPayload = {
      sub: command.userId,
      deviceId: command.deviceId,
    };

    const accessToken = this.jwtService.sign(accessTokenPayload, {
      secret: jwtConstants.accessTokenSecret,
      expiresIn: jwtConstants.accessTokenExpirationTime,
    });

    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: jwtConstants.refreshTokenSecret,
      expiresIn: jwtConstants.refreshTokenExpirationTime,
    });

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
}
