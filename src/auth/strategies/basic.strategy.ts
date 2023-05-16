import { BasicStrategy as Strategy } from 'passport-http';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { basicAuthConstants } from '../config/constants';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super();
  }

  public validate = async (username, password): Promise<boolean> => {
    if (
      basicAuthConstants.username === username &&
      basicAuthConstants.password === password
    ) {
      return true;
    }
    throw new UnauthorizedException();
  };
}
