import { CommandHandler } from '@nestjs/cqrs';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionBaseUseCase } from '../../../../_common/application/use-cases/transaction-base.use-case';
import { InjectDataSource } from '@nestjs/typeorm';
import { GameStatus } from '../../../../../enums/game-status.enum';
import { GamesTransactionsRepository } from '../../../../infrastructure/repositories/quiz/games.transactions.repository';
import { TransactionsRepository } from '../../../../infrastructure/repositories/common/transactions.repository';
import { Interval } from '@nestjs/schedule';

export class GameFinishCommand {}

@CommandHandler(GameFinishCommand)
export class GameFinishUseCase extends TransactionBaseUseCase<
  GameFinishCommand,
  void
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private readonly transactionsRepository: TransactionsRepository,
    private readonly gamesTransactionsRepository: GamesTransactionsRepository,
  ) {
    super(dataSource);
  }

  async doLogic(
    command: GameFinishCommand,
    manager: EntityManager,
  ): Promise<void> {
    const games = await this.gamesTransactionsRepository.findGamesToFinish(
      manager,
    );

    for (const game of games) {
      let fastPlayer = game.playerOne;
      if (game.playerTwo.answers.length === 5) {
        fastPlayer = game.playerTwo;
      }

      if (fastPlayer.score !== 0) {
        fastPlayer.score += 1;
      }

      await this.transactionsRepository.save(fastPlayer, manager);

      game.finishingExpirationDate = null;
      game.status = GameStatus.Finished;
      game.finishGameDate = new Date();
      await this.transactionsRepository.save(game, manager);
    }
  }

  @Interval(1000)
  public async execute(command: GameFinishCommand) {
    return super.execute(command);
  }
}
