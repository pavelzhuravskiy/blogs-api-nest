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

    let game = await this.gamesTransactionsRepository.findGameForConnection(
      command.userId,
      manager,
    );

    const player = new Player();
    player.user = user;
    player.score = 0;

    if (!game) {
      game = new Game();
      game.playerOne = player;
      game.status = GameStatus.PendingSecondPlayer;
      game.pairCreatedDate = new Date();
    } else {
      if (
        (game.status === GameStatus.PendingSecondPlayer &&
          game.playerOne.user.id === command.userId) ||
        game.status === GameStatus.Active
      ) {
        return {
          data: false,
          code: ResultCode.Forbidden,
        };
      }
      game.playerTwo = player;
      game.status = GameStatus.Active;
      game.startGameDate = new Date();
      game.questions =
        await this.questionsTransactionsRepository.findRandomQuestions(manager);
    }

    await this.transactionsRepository.save(player, manager);
    await this.transactionsRepository.save(game, manager);

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
