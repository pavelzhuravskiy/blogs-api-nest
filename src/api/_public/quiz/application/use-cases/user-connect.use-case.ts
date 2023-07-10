import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../infrastructure/repositories/users/users.repository';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionBaseUseCase } from '../../../../_common/application/use-cases/transaction-base.use-case';
import { InjectDataSource } from '@nestjs/typeorm';
import { QuizGame } from '../../../../entities/quiz/quiz-game.entity';
import { GameStatus } from '../../../../../enums/game-status.enum';
import { QuizPlayerProgress } from '../../../../entities/quiz/progress.entity';
import { QuizGamesRepository } from '../../../../infrastructure/repositories/quiz/quiz-games.repository';
import { QuizPlayerProgressesRepository } from '../../../../infrastructure/repositories/quiz/quiz-player-progresses.repository';
import { ExceptionResultType } from '../../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../../enums/result-code.enum';
import {
  userIDField,
  userNotFound,
} from '../../../../../exceptions/exception.constants';

export class UserConnectCommand {
  constructor(public userId: number) {}
}

@CommandHandler(UserConnectCommand)
export class UserConnectUseCase extends TransactionBaseUseCase<
  UserConnectCommand,
  ExceptionResultType<boolean>
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    protected readonly quizGamesRepository: QuizGamesRepository,
    protected readonly quizPlayerProgressesRepository: QuizPlayerProgressesRepository,
    protected readonly usersRepository: UsersRepository,
  ) {
    super(dataSource);
  }

  async doLogic(
    command: UserConnectCommand,
    manager: EntityManager,
  ): Promise<ExceptionResultType<boolean>> {
    // TODO Implement current game search

    const user = await this.usersRepository.findUserById(command.userId);

    if (!user) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: userIDField,
        message: userNotFound,
      };
    }

    /*if () {
      return {
        data: false,
        code: ResultCode.Forbidden,
        message: ,
      };
    }*/

    const game = new QuizGame();
    game.status = GameStatus.PendingSecondPlayer;
    game.pairCreatedDate = new Date();
    await this.quizGamesRepository.queryRunnerSave(game, manager);

    const playerProgress = new QuizPlayerProgress();
    playerProgress.user = user;
    playerProgress.game = game;
    playerProgress.score = 0;
    await this.quizPlayerProgressesRepository.queryRunnerSave(
      playerProgress,
      manager,
    );

    return {
      data: true,
      code: ResultCode.Success,
      response: game.id,
    };
  }

  public async execute(command: UserConnectCommand) {
    return super.execute(command);
  }
}
