import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { exceptionHandler } from '../../../exceptions/exception.handler';
import { ResultCode } from '../../../enums/result-code.enum';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UserIdFromGuard } from '../../_auth/decorators/user-id-from-guard.decorator';
import { JwtBearerGuard } from '../../_auth/guards/jwt-bearer.guard';
import { UserConnectCommand } from './application/use-cases/user-connect.use-case';
import { GamesQueryRepository } from '../../infrastructure/repositories/quiz/games.query.repository';
import {
  gameField,
  gameNotFound,
} from '../../../exceptions/exception.constants';
import { GameFindQuery } from './application/use-cases/game-find.use-case';
import { AnswerSendCommand } from './application/use-cases/answer-send.use-case';
import { AnswerInputDto } from '../../dto/quiz/input/answer-input.dto';

@Controller('pair-game-quiz')
export class PublicQuizController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private readonly gamesQueryRepository: GamesQueryRepository,
  ) {}

  @UseGuards(JwtBearerGuard)
  @Post('pairs/connection')
  @HttpCode(200)
  async connectUser(@UserIdFromGuard() userId) {
    const result = await this.commandBus.execute(
      new UserConnectCommand(userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return this.gamesQueryRepository.findGameById(result.response);
  }

  @UseGuards(JwtBearerGuard)
  @Get('pairs/my-current')
  async findCurrentGame(@UserIdFromGuard() userId) {
    const result = await this.gamesQueryRepository.findGameOfCurrentUser(
      userId,
    );

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, gameNotFound, gameField);
    }

    return result;
  }

  @UseGuards(JwtBearerGuard)
  @Get('pairs/:id')
  async findGame(@Param('id') gameId, @UserIdFromGuard() userId) {
    const result = await this.queryBus.execute(
      new GameFindQuery(gameId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result.response;
  }

  @UseGuards(JwtBearerGuard)
  @Post('pairs/my-current/answers')
  @HttpCode(200)
  async sendAnswer(
    @Body() answerInputDto: AnswerInputDto,
    @UserIdFromGuard() userId,
  ) {
    const gameId = await this.commandBus.execute(
      new AnswerSendCommand(answerInputDto, userId),
    );

    if (gameId.code !== ResultCode.Success) {
      return exceptionHandler(gameId.code, gameId.message, gameId.field);
    }

    return this.gamesQueryRepository.findAnswerInGame(gameId.response, userId);
  }
}
