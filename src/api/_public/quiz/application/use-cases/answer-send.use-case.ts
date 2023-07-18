import { CommandHandler } from '@nestjs/cqrs';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionBaseUseCase } from '../../../../_common/application/use-cases/transaction-base.use-case';
import { InjectDataSource } from '@nestjs/typeorm';
import { ExceptionResultType } from '../../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../../enums/result-code.enum';
import { AnswerInputDto } from '../../../../dto/quiz/input/answer-input.dto';
import { TransactionsRepository } from '../../../../infrastructure/repositories/common/transactions.repository';
import { UsersTransactionsRepository } from '../../../../infrastructure/repositories/users/users.transactions.repository';
import { GamesTransactionsRepository } from '../../../../infrastructure/repositories/quiz/games.transactions.repository';

export class AnswerSendCommand {
  constructor(public answerInputDto: AnswerInputDto, public userId: number) {}
}

@CommandHandler(AnswerSendCommand)
export class AnswerSendUseCase extends TransactionBaseUseCase<
  AnswerSendCommand,
  ExceptionResultType<boolean>
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private readonly transactionsRepository: TransactionsRepository,
    private readonly usersTransactionsRepository: UsersTransactionsRepository,
    private readonly gamesTransactionsRepository: GamesTransactionsRepository,
  ) {
    super(dataSource);
  }

  async doLogic(
    command: AnswerSendCommand,
    manager: EntityManager,
  ): Promise<ExceptionResultType<boolean>> {
    // const user = await this.usersTransactionsRepository.findUserById(
    //   command.userId,
    //   manager,
    // );
    //
    // if (!user) {
    //   return {
    //     data: false,
    //     code: ResultCode.NotFound,
    //     field: userIDField,
    //     message: userNotFound,
    //   };
    // }
    //
    // const currentGame =
    //   await this.gamesTransactionsRepository.findGameForAnswer(
    //     command.userId,
    //     manager,
    //   );
    //
    // if (!currentGame) {
    //   return {
    //     data: false,
    //     code: ResultCode.Forbidden,
    //   };
    // }
    //
    // const playerOne = currentGame.players[0];
    // const playerTwo = currentGame.players[1];
    //
    // let currentPlayer = playerOne;
    // if (playerTwo && command.userId === playerTwo.user.id) {
    //   currentPlayer = playerTwo;
    // }
    //
    // const questionIndex = currentPlayer.answers.length;
    // if (questionIndex >= 5) {
    //   return {
    //     data: false,
    //     code: ResultCode.Forbidden,
    //   };
    // }
    //
    // const currentQuestion = currentGame.questions[questionIndex];
    // let answerStatus = AnswerStatus.Incorrect;
    // const answerCheck = currentQuestion.correctAnswers.includes(
    //   command.answerInputDto.answer,
    // );
    // if (answerCheck) {
    //   answerStatus = AnswerStatus.Correct;
    //   currentPlayer.score += 1;
    //   await this.transactionsRepository.save(currentPlayer, manager);
    // }
    //
    // const answer = new Answer();
    // answer.player = currentPlayer;
    // answer.question = currentQuestion;
    // answer.answerStatus = answerStatus;
    // answer.addedAt = new Date();
    // await this.transactionsRepository.save(answer, manager);
    //
    // const playerOneAnswersCount = playerOne.answers.length;
    // const playerTwoAnswersCount = playerTwo.answers.length;
    //
    // if (
    //   (playerOneAnswersCount === 5 && playerTwoAnswersCount === 4) ||
    //   (playerOneAnswersCount === 4 && playerTwoAnswersCount === 5)
    // ) {
    //   let fastPlayer = playerOne;
    //   if (playerTwoAnswersCount === 5) {
    //     fastPlayer = playerTwo;
    //   }
    //
    //   if (fastPlayer.score !== 0) {
    //     fastPlayer.score += 1;
    //   }
    //
    //   await this.transactionsRepository.save(fastPlayer, manager);
    //
    //   currentGame.status = GameStatus.Finished;
    //   currentGame.finishGameDate = new Date();
    //   await this.transactionsRepository.save(currentGame, manager);
    // }

    return {
      data: true,
      code: ResultCode.Success,
      // response: currentGame.id,
    };
  }

  public async execute(command: AnswerSendCommand) {
    return super.execute(command);
  }
}
