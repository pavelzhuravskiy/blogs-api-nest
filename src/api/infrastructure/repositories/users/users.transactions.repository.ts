import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { User } from '../../../entities/users/user.entity';
import { UserEmailConfirmation } from '../../../entities/users/user-email-confirmation.entity';
import { UserPasswordRecovery } from '../../../entities/users/user-password-recovery.entity';

@Injectable()
export class UsersTransactionsRepository {
  // ***** Find user *****
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

  // ***** Email confirmation *****
  async findUserForEmailConfirm(
    confirmationCode: string,
    manager: EntityManager,
  ): Promise<User | null> {
    try {
      return await manager
        .createQueryBuilder(User, 'u')
        .where(`uec.confirmationCode = :confirmationCode`, {
          confirmationCode: confirmationCode,
        })
        .leftJoinAndSelect('u.userEmailConfirmation', 'uec')
        .getOne();
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async deleteEmailConfirmationRecord(
    userId: number,
    manager: EntityManager,
  ): Promise<boolean> {
    const result = await manager
      .createQueryBuilder(UserEmailConfirmation, 'uec')
      .delete()
      .from(UserEmailConfirmation)
      .where('userId = :userId', { userId: userId })
      .execute();
    return result.affected === 1;
  }

  // ***** Password update *****
  async findUserForPasswordUpdate(
    recoveryCode: string,
    manager: EntityManager,
  ): Promise<User | null> {
    try {
      return await manager
        .createQueryBuilder(User, 'u')
        .where(`upr.recoveryCode = :recoveryCode`, {
          recoveryCode: recoveryCode,
        })
        .leftJoinAndSelect('u.userPasswordRecovery', 'upr')
        .getOne();
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async deletePasswordRecoveryRecord(
    userId: number,
    manager: EntityManager,
  ): Promise<boolean> {
    const result = await manager
      .createQueryBuilder(UserPasswordRecovery, 'upr')
      .delete()
      .from(UserPasswordRecovery)
      .where('userId = :userId', { userId: userId })
      .execute();
    return result.affected === 1;
  }

  // ***** Ban user (super admin) *****
  async findUserForBanBySA(
    userId: string,
    manager: EntityManager,
  ): Promise<User | null> {
    try {
      return await manager
        .createQueryBuilder(User, 'u')
        .where(`u.id = :userId`, { userId: userId })
        .leftJoinAndSelect('u.userBanBySA', 'ubsa')
        .getOne();
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  // ***** Delete user *****
  async deleteUser(userId: number, manager: EntityManager): Promise<boolean> {
    const result = await manager
      .createQueryBuilder(User, 'u')
      .delete()
      .from(User)
      .where('id = :userId', { userId: userId })
      .execute();
    return result.affected === 1;
  }
}