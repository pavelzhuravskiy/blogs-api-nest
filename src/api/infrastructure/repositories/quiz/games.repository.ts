import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Game } from '../../../entities/quiz/game.entity';
import { GameStatus } from '../../../../enums/game-status.enum';

@Injectable()
export class GamesRepository {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  // ***** TypeORM query runner transaction SAVE *****
  async queryRunnerSave(
    entity: Game,
    queryRunnerManager: EntityManager,
  ): Promise<Game> {
    return queryRunnerManager.save(entity);
  }

  // ***** Find game operations *****
  async findGameById(gameId: string): Promise<Game | null> {
    try {
      return await this.gamesRepository
        .createQueryBuilder('game')
        .where(`game.id = :gameId`, {
          gameId: gameId,
        })
        .leftJoinAndSelect('game.players', 'p')
        .leftJoinAndSelect('p.user', 'u')
        .getOne();
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findGameWithPendingStatus(): Promise<Game | null> {
    try {
      return await this.gamesRepository
        .createQueryBuilder('game')
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

  async findGameOfCurrentUser(userId: number): Promise<Game | null> {
    const game = await this.gamesRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.players', 'p')
      .leftJoinAndSelect('p.user', 'u')
      .leftJoinAndSelect('p.answers', 'a')
      .leftJoinAndSelect('game.questions', 'q')
      .orderBy('p.player_id')
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
