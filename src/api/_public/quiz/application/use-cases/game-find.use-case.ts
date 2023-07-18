import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../infrastructure/repositories/users/users.repository';
import { ExceptionResultType } from '../../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../../enums/result-code.enum';
import { GamesQueryRepository } from '../../../../infrastructure/repositories/quiz/games.query.repository';
import {
  gameField,
  gameNotFound,
  userIDField,
  userNotFound,
} from '../../../../../exceptions/exception.constants';

export class GameFindQuery {
  constructor(public gameId: string, public userId: number) {}
}

@QueryHandler(GameFindQuery)
export class GameFindUseCase implements IQueryHandler<GameFindQuery> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly gamesQueryRepository: GamesQueryRepository,
  ) {}

  async execute(query: GameFindQuery): Promise<ExceptionResultType<boolean>> {
    const user = await this.usersRepository.findUserById(query.userId);

    if (!user) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: userIDField,
        message: userNotFound,
      };
    }

    const currentGame = await this.gamesQueryRepository.findGameById(
      query.gameId,
    );

    if (!currentGame) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: gameField,
        message: gameNotFound,
      };
    }

    // console.log(query.userId.toString(), 'QUERY');
    // console.log(currentGame.firstPlayerProgress.player.id, 'FP');
    // console.log(currentGame.secondPlayerProgress.player.id, 'SP');

    if (
      currentGame.firstPlayerProgress.player.id !== query.userId.toString() &&
      currentGame.secondPlayerProgress.player.id !== query.userId.toString()
    ) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    return {
      data: true,
      code: ResultCode.Success,
      response: currentGame,
    };
  }
}
