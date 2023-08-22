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
import {
  userIDField,
  userNotFound,
} from '../../../../../exceptions/exception.constants';
import { AnswerStatus } from '../../../../../enums/answer-status.enum';
import { Answer } from '../../../../entities/quiz/answer.entity';
import { GameStatus } from '../../../../../enums/game-status.enum';
import { add } from 'date-fns';

export class AnswerSendCommand {
  constructor(public answerInputDto: AnswerInputDto, public userId: string) {}
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

    const currentGame =
      await this.gamesTransactionsRepository.findGameForAnswer(
        command.userId,
        manager,
      );

    if (!currentGame) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    let currentPlayer = currentGame.playerOne;
    if (
      currentGame.playerTwo &&
      command.userId === currentGame.playerTwo.user.id
    ) {
      currentPlayer = currentGame.playerTwo;
    }

    const questionIndex = currentPlayer.answers.length;
    if (questionIndex >= 5) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    const currentQuestion = currentGame.questions[questionIndex];
    let answerStatus = AnswerStatus.Incorrect;
    const answerCheck = currentQuestion.correctAnswers.includes(
      command.answerInputDto.answer,
    );
    if (answerCheck) {
      answerStatus = AnswerStatus.Correct;
      currentPlayer.score += 1;
      await this.transactionsRepository.save(currentPlayer, manager);
    }

    const answer = new Answer();
    answer.player = currentPlayer;
    answer.question = currentQuestion;
    answer.answerStatus = answerStatus;
    answer.addedAt = new Date();
    await this.transactionsRepository.save(answer, manager);

    const playerOneAnswersCount = currentGame.playerOne.answers.length;
    const playerTwoAnswersCount = currentGame.playerTwo.answers.length;

    // Set game status to 'Finishing' when one player answered all questions
    if (
      (playerOneAnswersCount === 4 &&
        currentGame.playerOne.id === currentPlayer.id) ||
      (playerTwoAnswersCount === 4 &&
        currentGame.playerTwo.id === currentPlayer.id)
    ) {
      currentGame.finishingExpirationDate = add(new Date(), {
        seconds: 10,
      });
      await this.transactionsRepository.save(currentGame, manager);
    }

    // Finish game when all questions are answered
    if (
      (playerOneAnswersCount === 5 && playerTwoAnswersCount === 4) ||
      (playerOneAnswersCount === 4 && playerTwoAnswersCount === 5)
    ) {
      let fastPlayer = currentGame.playerOne;
      if (playerTwoAnswersCount === 5) {
        fastPlayer = currentGame.playerTwo;
      }

      if (fastPlayer.score !== 0) {
        fastPlayer.score += 1;
      }

      await this.transactionsRepository.save(fastPlayer, manager);

      currentGame.finishingExpirationDate = null;
      currentGame.status = GameStatus.Finished;
      currentGame.finishGameDate = new Date();
      await this.transactionsRepository.save(currentGame, manager);
    }

    return {
      data: true,
      code: ResultCode.Success,
      response: currentGame.id,
    };
  }

  public async execute(command: AnswerSendCommand) {
    return super.execute(command);
  }
}
