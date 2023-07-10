import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionCreateUseCase } from '../_superadmin/quiz/application/use-cases/question-create.use-case';
import { SuperAdminQuizController } from '../_superadmin/quiz/sa.quiz.controller';
import { QuizQuestion } from '../entities/quiz/question.entity';
import { QuizQuestionsRepository } from '../infrastructure/repositories/quiz/quiz-questions.repository';
import { QuizQuestionsQueryRepository } from '../infrastructure/repositories/quiz/quiz-questions.query.repository';
import { QuestionUpdateUseCase } from '../_superadmin/quiz/application/use-cases/question-update.use-case';
import { QuestionPublishUseCase } from '../_superadmin/quiz/application/use-cases/question-publish.use-case';
import { QuestionDeleteUseCase } from '../_superadmin/quiz/application/use-cases/question-delete.use-case';
import { QuizAnswer } from '../entities/quiz/answer.entity';
import { QuizPlayerProgress } from '../entities/quiz/progress.entity';
import { QuizGame } from '../entities/quiz/quiz-game.entity';
import { QuizGamesRepository } from '../infrastructure/repositories/quiz/quiz-games.repository';
import { QuizGamesQueryRepository } from '../infrastructure/repositories/quiz/quiz-games.query.repository';
import { QuizPlayerProgressesRepository } from '../infrastructure/repositories/quiz/quiz-player-progresses.repository';
import { UserConnectUseCase } from '../_public/quiz/application/use-cases/user-connect.use-case';
import { UsersRepository } from '../infrastructure/repositories/users/users.repository';
import { UsersModule } from './users.module';
import { PublicQuizController } from '../_public/quiz/public.quiz.controller';

const useCases = [
  QuestionCreateUseCase,
  QuestionUpdateUseCase,
  QuestionPublishUseCase,
  QuestionDeleteUseCase,
  UserConnectUseCase,
];

const entities = [QuizQuestion, QuizAnswer, QuizGame, QuizPlayerProgress];

const repositories = [
  QuizQuestionsRepository,
  QuizQuestionsQueryRepository,
  QuizGamesRepository,
  QuizGamesQueryRepository,
  QuizPlayerProgressesRepository,
  UsersRepository,
];

@Module({
  imports: [TypeOrmModule.forFeature([...entities]), CqrsModule, UsersModule],
  controllers: [SuperAdminQuizController, PublicQuizController],
  providers: [...useCases, ...repositories],
  exports: [TypeOrmModule],
})
export class QuizModule {}
