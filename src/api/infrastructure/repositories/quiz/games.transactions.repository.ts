import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Game } from '../../../entities/quiz/game.entity';
import { GameStatus } from '../../../../enums/game-status.enum';

@Injectable()
export class GamesTransactionsRepository {
  async findGameForConnection(
    userId: number,
    manager: EntityManager,
  ): Promise<Game | null> {
    return manager
      .createQueryBuilder(Game, 'game')
      .where(`game.status = :pending OR game.status = :active`, {
        pending: GameStatus.PendingSecondPlayer,
        active: GameStatus.Active,
      })
      .andWhere(`pou.id = :userId or ptu.id = :userId`, {
        userId: userId,
      })
      .leftJoinAndSelect('game.playerOne', 'po')
      .leftJoinAndSelect('game.playerTwo', 'pt')
      .leftJoinAndSelect('po.user', 'pou')
      .leftJoinAndSelect('pt.user', 'ptu')
      .getOne();
  }

  async findGameForAnswer(
    userId: number,
    manager: EntityManager,
  ): Promise</*Game | null*/ any> {
    const games = await manager
      .createQueryBuilder(Game, 'game')
      .setLock('pessimistic_write', undefined, ['game'])
      .where('game.status = :active', {
        active: GameStatus.Active,
      })
      .leftJoinAndSelect('game.players', 'p')
      .leftJoinAndSelect('game.questions', 'gq')
      .leftJoinAndSelect('p.user', 'u')
      .leftJoinAndSelect('p.answers', 'a')
      .leftJoinAndSelect('a.question', 'aq')
      .orderBy('p.player_id')
      .addOrderBy('gq.created_at', 'DESC')
      .addOrderBy('a.added_at')
      .getMany();

    return games;
  }
}
