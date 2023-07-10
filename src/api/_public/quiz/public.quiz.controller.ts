import { Controller, Post, UseGuards } from '@nestjs/common';
import { exceptionHandler } from '../../../exceptions/exception.handler';
import { ResultCode } from '../../../enums/result-code.enum';
import { CommandBus } from '@nestjs/cqrs';
import { UserIdFromGuard } from '../../_auth/decorators/user-id-from-guard.decorator';
import { JwtBearerGuard } from '../../_auth/guards/jwt-bearer.guard';
import { UserConnectCommand } from './application/use-cases/user-connect.use-case';
import { QuizGamesQueryRepository } from '../../infrastructure/repositories/quiz/quiz-games.query.repository';

@Controller('pair-game-quiz')
export class PublicQuizController {
  constructor(
    private commandBus: CommandBus,
    private readonly quizGamesQueryRepository: QuizGamesQueryRepository,
  ) {}

  @UseGuards(JwtBearerGuard)
  @Post('pairs/connection')
  async connectUser(@UserIdFromGuard() userId) {
    const result = await this.commandBus.execute(
      new UserConnectCommand(userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return this.quizGamesQueryRepository.findGame(result.response);
  }
}
