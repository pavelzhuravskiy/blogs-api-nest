import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Game } from '../../../entities/quiz/game.entity';
import { GameViewDto } from '../../../dto/quiz/view/game.view.dto';
import { GameStatus } from '../../../../enums/game-status.enum';

@Injectable()
export class GamesQueryRepository {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async findGameById(gameId: number | string): Promise<GameViewDto> {
    const games = await this.gamesRepository
      .createQueryBuilder('game')
      .where(`game.id = :gameId`, {
        gameId: gameId,
      })
      .leftJoinAndSelect('game.players', 'p')
      .leftJoinAndSelect('p.user', 'u')
      .leftJoinAndSelect('p.answers', 'a')
      .leftJoinAndSelect('game.questions', 'q')
      .orderBy('p.player_id')
      .getMany();

    const playersCount = games[0].players.length;
    const mappedQuizGames = await this.gamesMapping(games, playersCount);
    return mappedQuizGames[0];
  }

  async findGameOfCurrentUser(userId: number): Promise<GameViewDto> {
    const games = await this.gamesRepository
      .createQueryBuilder('game')
      .where(`game.status = :pending or game.status = :active`, {
        pending: GameStatus.PendingSecondPlayer,
        active: GameStatus.Active,
      })
      .leftJoinAndSelect('game.players', 'p')
      .leftJoinAndSelect('game.questions', 'gq')
      .leftJoinAndSelect('p.user', 'u')
      .leftJoinAndSelect('p.answers', 'a')
      .leftJoinAndSelect('a.question', 'aq')
      .orderBy('p.player_id')
      .addOrderBy('gq.created_at', 'DESC')
      .getMany();

    // console.log(games);

    if (games.length === 0) {
      return null;
    }

    const currentUserInGame = games[0].players.find(
      (p) => p.user.id === userId,
    );

    if (!currentUserInGame) {
      return null;
    }

    const playersCount = games[0].players.length;
    const mappedQuizGames = await this.gamesMapping(games, playersCount);
    return mappedQuizGames[0];
  }

  private async gamesMapping(
    array: Game[],
    playersCount: number,
  ): Promise<GameViewDto[]> {
    let secondPlayerProgress = null;
    let questions = null;

    return array.map((g) => {
      if (playersCount === 2) {
        secondPlayerProgress = {
          answers: g.players[1].answers.map((a) => {
            return {
              questionId: a.question.id.toString(),
              answerStatus: a.answerStatus,
              addedAt: a.addedAt,
            };
          }),
          player: {
            id: g.players[1].user.id.toString(),
            login: g.players[1].user.login,
          },
          score: g.players[1].score,
        };
        questions = g.questions.map((q) => {
          return {
            id: q.id.toString(),
            body: q.body,
          };
        });
      }

      return {
        id: g.id.toString(),
        firstPlayerProgress: {
          answers: g.players[0].answers.map((a) => {
            return {
              questionId: a.question.id.toString(),
              answerStatus: a.answerStatus,
              addedAt: a.addedAt,
            };
          }),
          player: {
            id: g.players[0].user.id.toString(),
            login: g.players[0].user.login,
          },
          score: g.players[0].score,
        },
        secondPlayerProgress: secondPlayerProgress,
        questions: questions,
        status: g.status,
        pairCreatedDate: g.pairCreatedDate,
        startGameDate: g.startGameDate,
        finishGameDate: g.finishGameDate,
      };
    });
  }
}
