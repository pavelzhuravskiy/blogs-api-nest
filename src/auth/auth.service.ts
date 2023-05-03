import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../users/users.repository';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async validateUser(loginOrEmail: string, password: string): Promise<any> {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      loginOrEmail,
    );

    if (!user || !user.emailConfirmation.isConfirmed) {
      return null;
    }

    const result = await bcrypt.compare(
      password,
      user.accountData.passwordHash,
    );

    if (result) {
      return user;
    }

    return null;
  }

  async login(currentUserId: string) {
    const payload = { sub: currentUserId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
