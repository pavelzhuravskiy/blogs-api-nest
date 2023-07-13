import { CommandHandler } from '@nestjs/cqrs';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionBaseUseCase } from '../../../../_common/application/use-cases/transaction-base.use-case';
import { InjectDataSource } from '@nestjs/typeorm';
import { Game } from '../../../../entities/quiz/game.entity';
import { GameStatus } from '../../../../../enums/game-status.enum';
import { Player } from '../../../../entities/quiz/player.entity';
import { ExceptionResultType } from '../../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../../enums/result-code.enum';
import {
  userIDField,
  userNotFound,
} from '../../../../../exceptions/exception.constants';
import { UsersTransactionsRepository } from '../../../../infrastructure/repositories/users/users.transactions.repository';
import { GamesTransactionsRepository } from '../../../../infrastructure/repositories/quiz/games.transactions.repository';
import { TransactionsRepository } from '../../../../infrastructure/repositories/common/transactions.repository';
import { QuestionsTransactionsRepository } from '../../../../infrastructure/repositories/quiz/questions.transactions.repository';

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
    private readonly transactionsRepository: TransactionsRepository,
    private readonly usersTransactionsRepository: UsersTransactionsRepository,
    private readonly gamesTransactionsRepository: GamesTransactionsRepository,
    private readonly questionsTransactionsRepository: QuestionsTransactionsRepository,
  ) {
    super(dataSource);
  }

  async doLogic(
    command: UserConnectCommand,
    manager: EntityManager,
  ): Promise<ExceptionResultType<boolean>> {
    const user = await this.usersTransactionsRepository.findUserById(
      command.userId,
      manager,
    );

    if (!user) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: userIDField,
        message: userNotFound,
      };
    }

    let currentGame =
      await this.gamesTransactionsRepository.findGameWithPendingStatus(manager);

    const player = new Player();
    player.user = user;
    player.score = 0;

    if (!currentGame) {
      player.playerId = 1;
      currentGame = new Game();
      currentGame.status = GameStatus.PendingSecondPlayer;
      currentGame.pairCreatedDate = new Date();
    } else {
      if (currentGame.players[0].user.id === command.userId) {
        return {
          data: false,
          code: ResultCode.Forbidden,
        };
      }
      player.playerId = 2;
      currentGame.status = GameStatus.Active;
      currentGame.startGameDate = new Date();
      currentGame.questions =
        await this.questionsTransactionsRepository.findRandomQuestions(manager);
    }

    await this.transactionsRepository.save(currentGame, manager);

    player.game = currentGame;
    await this.transactionsRepository.save(player, manager);

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
