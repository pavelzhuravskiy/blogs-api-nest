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

const useCases = [
  QuestionCreateUseCase,
  QuestionUpdateUseCase,
  QuestionPublishUseCase,
  QuestionDeleteUseCase,
];

const entities = [Question];

const repositories = [QuestionsRepository, QuestionsQueryRepository];

@Module({
  imports: [TypeOrmModule.forFeature([...entities]), CqrsModule],
  controllers: [SuperAdminQuizController],
  providers: [...useCases, ...repositories],
  exports: [TypeOrmModule],
})
export class QuizModule {}
