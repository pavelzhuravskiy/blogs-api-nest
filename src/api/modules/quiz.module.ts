import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionCreateUseCase } from '../_superadmin/quiz/application/use-cases/question-create.use-case';
import { SuperAdminQuizController } from '../_superadmin/quiz/sa.quiz.controller';
import { Question } from '../entities/quiz/question.entity';
import { QuestionsRepository } from '../infrastructure/repositories/quiz/questions.repository';
import { QuestionsQueryRepository } from '../infrastructure/repositories/quiz/questions.query.repository';
import { QuestionUpdateUseCase } from '../_superadmin/quiz/application/use-cases/question-update.use-case';
import { QuestionPublishUseCase } from '../_superadmin/quiz/application/use-cases/question-publish.use-case';
import { QuestionDeleteUseCase } from '../_superadmin/quiz/application/use-cases/question-delete.use-case';
import { Answer } from '../entities/quiz/answer.entity';
import { Player } from '../entities/quiz/player.entity';
import { Game } from '../entities/quiz/game.entity';
import { GamesRepository } from '../infrastructure/repositories/quiz/games.repository';
import { GamesQueryRepository } from '../infrastructure/repositories/quiz/games.query.repository';
import { UserConnectUseCase } from '../_public/quiz/application/use-cases/user-connect.use-case';
import { UsersRepository } from '../infrastructure/repositories/users/users.repository';
import { UsersModule } from './users.module';
import { PublicQuizController } from '../_public/quiz/public.quiz.controller';
import { GameFindUseCase } from '../_public/quiz/application/use-cases/game-find.use-case';
import { AnswerSendUseCase } from '../_public/quiz/application/use-cases/answer-send.use-case';
import { TransactionsRepository } from '../infrastructure/repositories/common/transactions.repository';
import { UsersTransactionsRepository } from '../infrastructure/repositories/users/users.transactions.repository';
import { GamesTransactionsRepository } from '../infrastructure/repositories/quiz/games.transactions.repository';
import { QuestionsTransactionsRepository } from '../infrastructure/repositories/quiz/questions.transactions.repository';
import { DataSourceRepository } from '../infrastructure/repositories/common/data-source.repository';

const useCases = [
  QuestionCreateUseCase,
  QuestionUpdateUseCase,
  QuestionPublishUseCase,
  QuestionDeleteUseCase,
  UserConnectUseCase,
  GameFindUseCase,
  AnswerSendUseCase,
];

const entities = [Question, Answer, Game, Player];

const repositories = [
  QuestionsRepository,
  QuestionsQueryRepository,
  QuestionsTransactionsRepository,
  GamesRepository,
  GamesQueryRepository,
  GamesTransactionsRepository,
  UsersTransactionsRepository,
  UsersRepository,
  TransactionsRepository,
  DataSourceRepository,
];

@Module({
  imports: [TypeOrmModule.forFeature([...entities]), CqrsModule, UsersModule],
  controllers: [SuperAdminQuizController, PublicQuizController],
  providers: [...useCases, ...repositories],
  exports: [TypeOrmModule],
})
export class QuizModule {}
