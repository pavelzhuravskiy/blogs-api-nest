import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../infrastructure/repositories/users/users.repository';
import { ExceptionResultType } from '../../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../../enums/result-code.enum';
import { GamesQueryRepository } from '../../../../infrastructure/repositories/quiz/games.query.repository';
import {
  gameField,
  gameIDField,
  gameNotFound,
  userIDField,
  userNotFound,
  uuidMessage,
} from '../../../../../exceptions/exception.constants';
import { isUUID } from 'class-validator';

export class GameFindQuery {
  constructor(public gameId: string, public userId: string) {}
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

    if (!isUUID(query.gameId)) {
      return {
        data: false,
        code: ResultCode.BadRequest,
        field: gameIDField,
        message: uuidMessage,
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

    const playerOneProgress = currentGame.firstPlayerProgress;
    const playerTwoProgress = currentGame.secondPlayerProgress;

    if (playerOneProgress && !playerTwoProgress) {
      if (playerOneProgress.player.id !== query.userId.toString()) {
        return {
          data: false,
          code: ResultCode.Forbidden,
        };
      }
    }

    if (
      playerOneProgress.player.id !== query.userId.toString() &&
      playerTwoProgress.player.id !== query.userId.toString()
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
