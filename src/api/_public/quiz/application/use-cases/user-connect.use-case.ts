import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../infrastructure/repositories/users/users.repository';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionBaseUseCase } from '../../../../_common/application/use-cases/transaction-base.use-case';
import { InjectDataSource } from '@nestjs/typeorm';
import { Game } from '../../../../entities/quiz/game.entity';
import { GameStatus } from '../../../../../enums/game-status.enum';
import { Player } from '../../../../entities/quiz/player.entity';
import { GamesRepository } from '../../../../infrastructure/repositories/quiz/games.repository';
import { PlayersRepository } from '../../../../infrastructure/repositories/quiz/players.repository';
import { ExceptionResultType } from '../../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../../enums/result-code.enum';
import {
  userIDField,
  userNotFound,
} from '../../../../../exceptions/exception.constants';
import { QuestionsRepository } from '../../../../infrastructure/repositories/quiz/questions.repository';

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
    protected readonly gamesRepository: GamesRepository,
    protected readonly playersRepository: PlayersRepository,
    protected readonly questionsRepository: QuestionsRepository,
    protected readonly usersRepository: UsersRepository,
  ) {
    super(dataSource);
  }

  async doLogic(
    command: UserConnectCommand,
    manager: EntityManager,
  ): Promise<ExceptionResultType<boolean>> {
    const user = await this.usersRepository.findUserById(command.userId);

    if (!user) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: userIDField,
        message: userNotFound,
      };
    }

    let currentGame = await this.gamesRepository.findGameWithPendingStatus();

    if (!currentGame) {
      currentGame = new Game();
      currentGame.status = GameStatus.PendingSecondPlayer;
      currentGame.pairCreatedDate = new Date();
      await this.gamesRepository.queryRunnerSave(currentGame, manager);
    } else {
      if (currentGame.players[0].user.id === command.userId) {
        return {
          data: false,
          code: ResultCode.Forbidden,
        };
      }
      currentGame.status = GameStatus.Active;
      currentGame.startGameDate = new Date();
      currentGame.questions =
        await this.questionsRepository.findRandomQuestions();

      await this.gamesRepository.queryRunnerSave(currentGame, manager);
    }

    const player = new Player();
    player.user = user;
    player.game = currentGame;
    player.score = 0;
    await this.playersRepository.queryRunnerSave(player, manager);

    return {
      data: true,
      code: ResultCode.Success,
      response: currentGame.id,
    };
  }

  public async execute(command: UserConnectCommand) {
    return super.execute(command);
  }
}
