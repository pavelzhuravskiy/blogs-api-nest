import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../infrastructure/repositories/users/users.repository';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionBaseUseCase } from '../../../../_common/application/use-cases/transaction-base.use-case';
import { InjectDataSource } from '@nestjs/typeorm';
import { GamesRepository } from '../../../../infrastructure/repositories/quiz/games.repository';
import { PlayersRepository } from '../../../../infrastructure/repositories/quiz/players.repository';
import { ExceptionResultType } from '../../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../../enums/result-code.enum';
import {
  userIDField,
  userNotFound,
} from '../../../../../exceptions/exception.constants';
import { AnswerInputDto } from '../../../../dto/quiz/input/answer-input.dto';
import { AnswersRepository } from '../../../../infrastructure/repositories/quiz/answers.repository';
import { Answer } from '../../../../entities/quiz/answer.entity';
import { AnswerStatus } from '../../../../../enums/answer-status.enum';

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
    private readonly usersRepository: UsersRepository,
    private readonly gamesRepository: GamesRepository,
    private readonly answersRepository: AnswersRepository,
    private readonly playersRepository: PlayersRepository,
  ) {
    super(dataSource);
  }

  async doLogic(
    command: AnswerSendCommand,
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

    const currentGame = await this.gamesRepository.findGameOfCurrentUser(
      command.userId,
    );

    if (!currentGame) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    let currentPlayer = currentGame.players[0];
    if (command.userId === currentGame.players[1].user.id) {
      currentPlayer = currentGame.players[1];
    }

    const questionIndex = currentPlayer.answers.length;
    const currentQuestion = currentGame.questions[questionIndex];

    let answerStatus = AnswerStatus.Incorrect;
    const answerCheck = currentQuestion.correctAnswers.includes(
      command.answerInputDto.answer,
    );
    if (answerCheck) {
      answerStatus = AnswerStatus.Correct;
      currentPlayer.score = currentPlayer.score + 1;
      await this.playersRepository.queryRunnerSave(currentPlayer, manager);
    }

    const answer = new Answer();
    answer.player = currentPlayer;
    answer.question = currentQuestion;
    answer.answerStatus = answerStatus;
    answer.addedAt = new Date();
    await this.answersRepository.queryRunnerSave(answer, manager);

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
