import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
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
import { GameQueryDto } from '../../dto/quiz/query/game.query.dto';
import { PlayerTopQueryDto } from '../../dto/quiz/query/player-top.query.dto';

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
  async connectUser(@UserIdFromGuard() userId: string) {
    const result = await this.commandBus.execute(
      new UserConnectCommand(userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return this.gamesQueryRepository.findGameById(result.response);
  }

  @Get('users/top')
  async getTop(@Query() query: PlayerTopQueryDto) {
    return this.gamesQueryRepository.getTop(query);
  }

  @UseGuards(JwtBearerGuard)
  @Get('users/my-statistic')
  async getStatistics(@UserIdFromGuard() userId: string) {
    return this.gamesQueryRepository.getStatistics(userId);
  }

  @UseGuards(JwtBearerGuard)
  @Get('pairs/my')
  async findMyGames(
    @Query() query: GameQueryDto,
    @UserIdFromGuard() userId: string,
  ) {
    return this.gamesQueryRepository.findMyGames(query, userId);
  }

  @UseGuards(JwtBearerGuard)
  @Get('pairs/my-current')
  async findCurrentGame(@UserIdFromGuard() userId: string) {
    const result = await this.gamesQueryRepository.findCurrentGame(userId);

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, gameNotFound, gameField);
    }

    return result;
  }

  @UseGuards(JwtBearerGuard)
  @Get('pairs/:id')
  async findGame(
    @Param('id') gameId: string,
    @UserIdFromGuard() userId: string,
  ) {
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
    @UserIdFromGuard() userId: string,
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
