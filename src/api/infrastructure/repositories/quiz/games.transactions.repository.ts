import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Game } from '../../../entities/quiz/game.entity';
import { GameStatus } from '../../../../enums/game-status.enum';

@Injectable()
export class GamesTransactionsRepository {
  async findGameWithPendingStatus(
    manager: EntityManager,
  ): Promise<Game | null> {
    try {
      return await manager
        .createQueryBuilder(Game, 'game')
        .where(`game.status = :gameStatus`, {
          gameStatus: GameStatus.PendingSecondPlayer,
        })
        .leftJoinAndSelect('game.players', 'p')
        .leftJoinAndSelect('p.user', 'u')
        .getOne();
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findGameOfCurrentUser(
    userId: number,
    manager: EntityManager,
  ): Promise<Game | null> {
    const game = await manager
      .createQueryBuilder(Game, 'game')
      // .setLock('pessimistic_write')
      .leftJoinAndSelect('game.players', 'p')
      .leftJoinAndSelect('game.questions', 'gq')
      .leftJoinAndSelect('p.user', 'u')
      .leftJoinAndSelect('p.answers', 'a')
      .leftJoinAndSelect('a.question', 'aq')
      .orderBy('p.player_id')
      .addOrderBy('gq.created_at', 'DESC')
      .addOrderBy('a.added_at')
      .getOne();

    if (!game) {
      return null;
    }

    const currentUserInGame = game.players.find((p) => p.user.id === userId);

    if (!currentUserInGame) {
      return null;
    }

    return game;
  }
}
