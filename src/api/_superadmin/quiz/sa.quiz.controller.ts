import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { QuestionInputDto } from '../../dto/quiz/input/question.Input.dto';
import { BasicAuthGuard } from '../../_auth/guards/basic-auth.guard';
import { QuestionCreateCommand } from './application/use-cases/question-create.use-case';
import { QuestionsQueryRepository } from '../../infrastructure/repositories/quiz/questions.query.repository';
import { QuestionQueryDto } from '../../dto/quiz/query/question.query.dto';
import { ResultCode } from '../../../enums/result-code.enum';
import { exceptionHandler } from '../../../exceptions/exception.handler';
import { QuestionUpdateCommand } from './application/use-cases/question-update.use-case';
import {
  questionField,
  questionNotFound,
} from '../../../exceptions/exception.constants';
import { QuestionPublishInputDto } from '../../dto/quiz/input/question-publish.Input.dto';
import { QuestionPublishCommand } from './application/use-cases/question-publish.use-case';
import { QuestionDeleteCommand } from './application/use-cases/question-delete.use-case';

@Controller('sa/quiz/questions')
export class SuperAdminQuizController {
  constructor(
    private commandBus: CommandBus,
    private readonly questionsQueryRepository: QuestionsQueryRepository,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Post()
  async createQuestion(@Body() questionInputDto: QuestionInputDto) {
    const questionId = await this.commandBus.execute(
      new QuestionCreateCommand(questionInputDto),
    );

    return this.questionsQueryRepository.findQuestion(questionId);
  }

  @UseGuards(BasicAuthGuard)
  @Get()
  async findQuestions(@Query() query: QuestionQueryDto) {
    return this.questionsQueryRepository.findQuestions(query);
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async updateQuestion(
    @Body() questionInputDto: QuestionInputDto,
    @Param('id') questionId: string,
  ) {
    const result = await this.commandBus.execute(
      new QuestionUpdateCommand(questionInputDto, questionId),
    );

    if (!result) {
      return exceptionHandler(
        ResultCode.NotFound,
        questionNotFound,
        questionField,
      );
    }

    return result;
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id/publish')
  @HttpCode(204)
  async publishQuestion(
    @Body() questionPublishInputDto: QuestionPublishInputDto,
    @Param('id') questionId: string,
  ) {
    const result = await this.commandBus.execute(
      new QuestionPublishCommand(questionPublishInputDto, questionId),
    );

    if (!result) {
      return exceptionHandler(
        ResultCode.NotFound,
        questionNotFound,
        questionField,
      );
    }

    return result;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteQuestion(@Param('id') questionId: string) {
    const result = await this.commandBus.execute(
      new QuestionDeleteCommand(questionId),
    );

    if (!result) {
      return exceptionHandler(
        ResultCode.NotFound,
        questionNotFound,
        questionField,
      );
    }

    return result;
  }
}
