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
import { GameQueryDto } from '../../../dto/quiz/query/game.query.dto';

@Injectable()
export class GamesQueryRepository {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async findMyGames(
    query: GameQueryDto,
    userId: string,
  ): Promise</*Paginator<GameViewDto[]>*/ any> {
    const games = await this.gamesRepository
      .createQueryBuilder('game')
      .addSelect(
        (qb) =>
          qb
            .select(
              `jsonb_agg(json_build_object('po_score', pos, 'po_user_id', pouid, 'po_user_login', poul, 'po_answers', p_one_answers)
                       )`,
            )
            .from((qb) => {
              return qb
                .select(`pou.id`, 'pouid')
                .addSelect(`pou.login`, 'poul')
                .addSelect(`po.score`, 'pos')
                .addSelect(
                  (qb) =>
                    qb
                      .select(
                        `jsonb_agg(json_build_object('q_id', aqid, 'a_status', aas, 'a_added_at', to_char(
            aaa::timestamp at time zone 'UTC',
            'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'))
                         )`,
                      )
                      .from((qb) => {
                        return qb
                          .select(`a.questionId`, 'aqid')
                          .addSelect(`a.playerId`, 'apid')
                          .addSelect(`a.answerStatus`, 'aas')
                          .addSelect(`a.addedAt`, 'aaa')
                          .from(Answer, 'a')
                          .where('a.playerId = po.id');
                      }, 'a_agg'),

                  'p_one_answers',
                )
                .from(Game, 'g')
                .leftJoin('g.playerOne', 'po')
                .leftJoin('po.user', 'pou')
                .leftJoin('po.answers', 'poa')
                .leftJoin('poa.question', 'poaq')
                .where('pou.id = :userId', {
                  userId: userId,
                })
                .andWhere('g.id = game.id')
                .limit(1);
            }, 'agg'),

        'p_one',
      )
      .leftJoin('game.playerOne', 'po')
      .leftJoin('po.user', 'pou')
      .where('pou.id = :userId', {
        userId: userId,
      })
      .orderBy(`game.${query.sortBy}`, query.sortDirection)
      .skip(0)
      .take(10)
      .getRawMany();

    // console.log(games);

    // console.log(games);
    return games;

    // const totalCount = await this.gamesRepository
    //   .createQueryBuilder('game')
    //   .leftJoinAndSelect('game.questions', 'gq')
    //   .leftJoinAndSelect('game.playerOne', 'po')
    //   .leftJoinAndSelect('po.user', 'pou')
    //   .leftJoinAndSelect('po.answers', 'poa')
    //   .leftJoinAndSelect('poa.question', 'poaq')
    //   .leftJoinAndSelect('game.playerTwo', 'pt')
    //   .leftJoinAndSelect('pt.user', 'ptu')
    //   .leftJoinAndSelect('pt.answers', 'pta')
    //   .leftJoinAndSelect('pta.question', 'ptaq')
    //   .where('(pou.id = :userId or ptu.id = :userId)', { userId: userId })
    //   .getCount();
    //
    // return Paginator.paginate({
    //   pageNumber: query.pageNumber,
    //   pageSize: query.pageSize,
    //   totalCount: totalCount,
    //   items: await this.gamesMapping(games),
    // });
  }

  async findCurrentGame(userId: string): Promise<GameViewDto> {
    const games = await this.gamesRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.questions', 'gq')
      .leftJoinAndSelect('game.playerOne', 'po')
      .leftJoinAndSelect('po.user', 'pou')
      .leftJoinAndSelect('po.answers', 'poa')
      .leftJoinAndSelect('poa.question', 'poaq')
      .leftJoinAndSelect('game.playerTwo', 'pt')
      .leftJoinAndSelect('pt.user', 'ptu')
      .leftJoinAndSelect('pt.answers', 'pta')
      .leftJoinAndSelect('pta.question', 'ptaq')
      .where(`game.status = :pending or game.status = :active`, {
        pending: GameStatus.PendingSecondPlayer,
        active: GameStatus.Active,
      })
      .andWhere('(pou.id = :userId or ptu.id = :userId)', { userId: userId })
      .orderBy('gq.createdAt', 'DESC')
      .addOrderBy('poa.addedAt')
      .addOrderBy('pta.addedAt')
      .getMany();

    if (games.length === 0) {
      return null;
    }

    const mappedGames = await this.gamesMapping(games);
    return mappedGames[0];
  }

  async findGameById(gameId: string): Promise<GameViewDto> {
    try {
      const games = await this.gamesRepository
        .createQueryBuilder('game')
        .leftJoinAndSelect('game.questions', 'gq')
        .leftJoinAndSelect('game.playerOne', 'po')
        .leftJoinAndSelect('po.user', 'pou')
        .leftJoinAndSelect('po.answers', 'poa')
        .leftJoinAndSelect('poa.question', 'poaq')
        .leftJoinAndSelect('game.playerTwo', 'pt')
        .leftJoinAndSelect('pt.user', 'ptu')
        .leftJoinAndSelect('pt.answers', 'pta')
        .leftJoinAndSelect('pta.question', 'ptaq')
        .where(`game.id = :gameId`, {
          gameId: gameId,
        })
        .orderBy('gq.createdAt', 'DESC')
        .addOrderBy('poa.addedAt')
        .addOrderBy('pta.addedAt')
        .getMany();

      if (games.length === 0) {
        return null;
      }

      const mappedGames = await this.gamesMapping(games);
      return mappedGames[0];
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findAnswerInGame(
    gameId: string,
    userId: string,
  ): Promise<AnswerViewDto> {
    const games = await this.gamesRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.questions', 'gq')
      .leftJoinAndSelect('game.playerOne', 'po')
      .leftJoinAndSelect('po.user', 'pou')
      .leftJoinAndSelect('po.answers', 'poa')
      .leftJoinAndSelect('poa.question', 'poaq')
      .leftJoinAndSelect('game.playerTwo', 'pt')
      .leftJoinAndSelect('pt.user', 'ptu')
      .leftJoinAndSelect('pt.answers', 'pta')
      .leftJoinAndSelect('pta.question', 'ptaq')
      .where(`game.id = :gameId`, {
        gameId: gameId,
      })
      .andWhere(`(pou.id = :userId or ptu.id = :userId)`, {
        userId: userId,
      })
      .orderBy('gq.createdAt', 'DESC')
      .addOrderBy('poa.addedAt')
      .addOrderBy('pta.addedAt')
      .getMany();

    if (games.length === 0) {
      return null;
    }

    let answers = games[0].playerOne.answers;
    if (games[0].playerTwo.user.id === userId) {
      answers = games[0].playerTwo.answers;
    }

    const mappedAnswers = await this.answersMapping(answers);
    return mappedAnswers[mappedAnswers.length - 1];
  }

  private async gamesMapping(games: Game[]): Promise<GameViewDto[]> {
    let playersCount = 1;
    if (games[0].playerTwo) {
      playersCount = 2;
    }

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
