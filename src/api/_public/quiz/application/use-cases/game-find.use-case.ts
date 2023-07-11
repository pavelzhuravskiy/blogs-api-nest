import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../infrastructure/repositories/users/users.repository';
import {
  gameField,
  gameNotFound,
  userIDField,
  userNotFound,
} from '../../../../../exceptions/exception.constants';
import { GamesRepository } from '../../../../infrastructure/repositories/quiz/games.repository';
import { ExceptionResultType } from '../../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../../enums/result-code.enum';
import { GamesQueryRepository } from '../../../../infrastructure/repositories/quiz/games.query.repository';

export class GameFindQuery {
  constructor(public gameId: string, public userId: number) {}
}

@QueryHandler(GameFindQuery)
export class GameFindUseCase implements IQueryHandler<GameFindQuery> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly gamesRepository: GamesRepository,
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

    const currentGame = await this.gamesRepository.findGameById(query.gameId);

    if (!currentGame) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: gameField,
        message: gameNotFound,
      };
    }

    const currentUserInGame = currentGame.players.find(
      (p) => p.user.id === query.userId,
    );

    if (!currentUserInGame) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    const response = await this.gamesQueryRepository.findGameById(query.gameId);

    return {
      data: true,
      code: ResultCode.Success,
      response: response,
    };
  }
}
