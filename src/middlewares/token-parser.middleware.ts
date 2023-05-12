import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenParserMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}
  use(req, res: Response, next: NextFunction) {
    const accessToken = req.headers.authorization?.split(' ')[1];

    if (accessToken) {
      const decodedToken = this.jwtService.decode(accessToken);
      req.userId = decodedToken.sub;
    }

    next();
  }
}
