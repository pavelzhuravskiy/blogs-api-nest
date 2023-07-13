import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { User } from '../../../entities/users/user.entity';

@Injectable()
export class UsersTransactionsRepository {
  async findUserById(
    userId: number,
    manager: EntityManager,
  ): Promise<User | null> {
    try {
      return await manager
        .createQueryBuilder(User, 'u')
        .where(`u.id = :userId`, { userId: userId })
        .getOne();
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
