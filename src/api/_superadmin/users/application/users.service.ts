import { User } from '../../../entities/users/user.entity';
import bcrypt from 'bcrypt';
import { UserBanBySA } from '../../../entities/users/user-ban-by-sa.entity';
import { UserBanByBlogger } from '../../../entities/users/user-ban-by-blogger.entity';

export class UsersService {
  async createUser(command: any) {
    // Create user
    const user = new User();
    user.login = command.userInputDto.login;
    user.passwordHash = await bcrypt.hash(
      command.userInputDto.password,
      Number(process.env.HASH_ROUNDS),
    );
    user.email = command.userInputDto.email;

    // Create user ban by SA record
    const userBanBySA = new UserBanBySA();
    userBanBySA.user = user;
    userBanBySA.isBanned = false;

    // Create user ban by blogger record
    const userBanByBlogger = new UserBanByBlogger();
    userBanByBlogger.user = user;
    userBanByBlogger.isBanned = false;

    return { user, userBanBySA, userBanByBlogger };
  }
}
