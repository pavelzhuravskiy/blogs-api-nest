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

  async findGameById(gameId: number | string): Promise</*GameViewDto*/ any> {
    const game = await this.gamesRepository
      .createQueryBuilder('game')
      .where(`game.id = :gameId`, {
        gameId: gameId,
      })
      .leftJoinAndSelect('game.questions', 'gq')
      .leftJoinAndSelect('game.playerOne', 'po')
      .leftJoinAndSelect('po.user', 'pou')
      .leftJoinAndSelect('po.answers', 'poa')
      .leftJoinAndSelect('poa.question', 'poaq')
      .leftJoinAndSelect('game.playerTwo', 'pt')
      .leftJoinAndSelect('pt.user', 'ptu')
      .leftJoinAndSelect('pt.answers', 'pta')
      .leftJoinAndSelect('pta.question', 'ptaq')
      .addOrderBy('gq.created_at', 'DESC')
      // .addOrderBy('poa.added_at')
      // .addOrderBy('pta.added_at')
      .getMany();

    let playersCount = 1;
    if (game[0].playerTwo) {
      playersCount = 2;
    }

    const mappedGame = await this.gamesMapping(game, playersCount);
    return mappedGame[0];
  }

  async findAnswerInGame(
    gameId: number,
    userId: number,
  ): Promise</*AnswerViewDto*/ any> {
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

    return games[0];

    // const answers = games[0].players[0].answers;
    // const mappedAnswers = await this.answersMapping(answers);
    // return mappedAnswers[mappedAnswers.length - 1];
  }

  async findGameOfCurrentUser(userId: number): Promise</*GameViewDto*/ any> {
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
      .getOne();

    // if (!gameOfCurrentUser) {
    //   return null;
    // }

    // const playersCount = gameOfCurrentUser.players.length;
    // const mappedGames = await this.gamesMapping(games, playersCount);
    // return mappedGames[0];
  }

  private async gamesMapping(
    games: Game[],
    playersCount: number,
  ): Promise<GameViewDto[]> {
    let secondPlayerProgress = null;
    let questions = null;

    return games.map((g) => {
      if (playersCount === 2) {
        secondPlayerProgress = {
          answers: g.playerTwo.answers.map((a) => {
            return {
              questionId: a.question.id.toString(),
              answerStatus: a.answerStatus,
              addedAt: a.addedAt,
            };
          }),
          player: {
            id: g.playerTwo.user.id.toString(),
            login: g.playerTwo.user.login,
          },
          score: g.playerTwo.score,
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
          answers: g.playerOne.answers.map((a) => {
            return {
              questionId: a.question.id.toString(),
              answerStatus: a.answerStatus,
              addedAt: a.addedAt,
            };
          }),
          player: {
            id: g.playerOne.user.id.toString(),
            login: g.playerOne.user.login,
          },
          score: g.playerOne.score,
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
