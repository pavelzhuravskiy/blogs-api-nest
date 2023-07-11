import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Game } from '../../../entities/quiz/game.entity';
import { GameViewDto } from '../../../dto/quiz/view/game.view.dto';

@Injectable()
export class GamesQueryRepository {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async findGame(gameId: number): Promise<any> {
    const games = await this.gamesRepository
      .createQueryBuilder('game')
      .where(`game.id = :gameId`, {
        gameId: gameId,
      })
      .leftJoinAndSelect('game.players', 'p')
      .leftJoinAndSelect('p.user', 'u')
      .leftJoinAndSelect('p.answers', 'a')
      .leftJoinAndSelect('game.questions', 'q')
      .getMany();

    // console.log(games);

    const playersCount = games[0].players.length;
    const mappedQuizGames = await this.gamesMapping(games, playersCount);
    return mappedQuizGames[0];
  }

  private async gamesMapping(
    array: Game[],
    playersCount: number,
  ): Promise<GameViewDto[]> {
    let secondPlayerProgress = null;
    return array.map((g) => {
      if (playersCount === 2) {
        secondPlayerProgress = {
          answers: g.players[1].answers,
          player: {
            id: g.players[1].user.id.toString(),
            login: g.players[1].user.login,
          },
          score: g.players[1].score,
        };
      }
      return {
        id: g.id.toString(),
        firstPlayerProgress: {
          answers: g.players[0].answers,
          player: {
            id: g.players[0].user.id.toString(),
            login: g.players[0].user.login,
          },
          score: g.players[0].score,
        },
        secondPlayerProgress: secondPlayerProgress,
        questions: g.questions.map((q) => {
          return {
            id: q.id.toString(),
            body: q.body,
          };
        }),
        status: g.status,
        pairCreatedDate: g.pairCreatedDate,
        startGameDate: g.startGameDate,
        finishGameDate: g.finishGameDate,
      };
    });
  }
}
