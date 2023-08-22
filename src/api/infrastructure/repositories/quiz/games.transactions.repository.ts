import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Game } from '../../../entities/quiz/game.entity';
import { GameStatus } from '../../../../enums/game-status.enum';

@Injectable()
export class GamesTransactionsRepository {
  async findGameForConnection(
    userId: string,
    manager: EntityManager,
  ): Promise<Game | null> {
    return manager
      .createQueryBuilder(Game, 'game')
      .leftJoinAndSelect('game.playerOne', 'po')
      .leftJoinAndSelect('game.playerTwo', 'pt')
      .leftJoinAndSelect('po.user', 'pou')
      .leftJoinAndSelect('pt.user', 'ptu')
      .where(`game.status = :pending or game.status = :active`, {
        pending: GameStatus.PendingSecondPlayer,
        active: GameStatus.Active,
      })
      .andWhere(`(pou.id = :userId or ptu.id = :userId)`, {
        userId: userId,
      })
      .getOne();
  }

  async findGameForAnswer(
    userId: string,
    manager: EntityManager,
  ): Promise<Game | null> {
    return manager
      .createQueryBuilder(Game, 'game')
      .setLock('pessimistic_write', undefined, ['game'])
      .leftJoinAndSelect('game.questions', 'gq')
      .leftJoinAndSelect('game.playerOne', 'po')
      .leftJoinAndSelect('po.user', 'pou')
      .leftJoinAndSelect('po.answers', 'poa')
      .leftJoinAndSelect('poa.question', 'poaq')
      .leftJoinAndSelect('game.playerTwo', 'pt')
      .leftJoinAndSelect('pt.user', 'ptu')
      .leftJoinAndSelect('pt.answers', 'pta')
      .leftJoinAndSelect('pta.question', 'ptaq')
      .where('game.status = :active', {
        active: GameStatus.Active,
      })
      .andWhere('(pou.id = :userId or ptu.id = :userId)', { userId: userId })
      .orderBy('gq.created_at', 'DESC')
      .addOrderBy('poa.added_at')
      .addOrderBy('pta.added_at')
      .getOne();
  }

  async findGamesToFinish(manager: EntityManager): Promise<Game[] | null> {
    return manager
      .createQueryBuilder(Game, 'game')
      .leftJoinAndSelect('game.questions', 'gq')
      .leftJoinAndSelect('game.playerOne', 'po')
      .leftJoinAndSelect('po.user', 'pou')
      .leftJoinAndSelect('po.answers', 'poa')
      .leftJoinAndSelect('poa.question', 'poaq')
      .leftJoinAndSelect('game.playerTwo', 'pt')
      .leftJoinAndSelect('pt.user', 'ptu')
      .leftJoinAndSelect('pt.answers', 'pta')
      .leftJoinAndSelect('pta.question', 'ptaq')
      .andWhere('game.finishingExpirationDate < now()')
      .getMany();
  }
}
