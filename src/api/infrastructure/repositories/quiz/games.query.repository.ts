import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Game } from '../../../entities/quiz/game.entity';
import {
  AnswerViewDto,
  GameViewDto,
} from '../../../dto/quiz/view/game.view.dto';
import { GameStatus } from '../../../../enums/game-status.enum';
import { Answer } from '../../../entities/quiz/answer.entity';

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
      .leftJoinAndSelect('game.questions', 'gq')
      .leftJoinAndSelect('p.user', 'u')
      .leftJoinAndSelect('p.answers', 'a')
      .leftJoinAndSelect('a.question', 'aq')
      .orderBy('p.player_id')
      .addOrderBy('gq.created_at', 'DESC')
      .addOrderBy('a.added_at')
      .getMany();

    const playersCount = games[0].players.length;
    const mappedGames = await this.gamesMapping(games, playersCount);
    return mappedGames[0];
  }

  async findAnswerInGame(
    gameId: number,
    userId: number,
  ): Promise<AnswerViewDto> {
    const games = await this.gamesRepository
      .createQueryBuilder('game')
      .where(`game.id = :gameId`, {
        gameId: gameId,
      })
      .andWhere(`u.id = :userId`, {
        userId: userId,
      })
      .leftJoinAndSelect('game.players', 'p')
      .leftJoinAndSelect('p.user', 'u')
      .leftJoinAndSelect('p.answers', 'a')
      .leftJoinAndSelect('a.question', 'aq')
      .orderBy('p.player_id')
      .addOrderBy('a.added_at')
      .getMany();

    const answers = games[0].players[0].answers;
    const mappedAnswers = await this.answersMapping(answers);
    return mappedAnswers[mappedAnswers.length - 1];
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
      .addOrderBy('a.added_at')
      .getMany();

    const gameOfCurrentUser = games.find((g) => {
      if (g.players.length === 1) {
        return g.players[0].user.id === userId;
      } else {
        return (
          g.players[0].user.id === userId || g.players[1].user.id === userId
        );
      }
    });

    if (!gameOfCurrentUser) {
      return null;
    }

    const playersCount = gameOfCurrentUser.players.length;
    const mappedGames = await this.gamesMapping(games, playersCount);
    return mappedGames[0];
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

  private async answersMapping(array: Answer[]): Promise<AnswerViewDto[]> {
    return array.map((a) => {
      return {
        questionId: a.question.id.toString(),
        answerStatus: a.answerStatus,
        addedAt: a.addedAt,
      };
    });
  }
}
