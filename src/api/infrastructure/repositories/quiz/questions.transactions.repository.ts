import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Question } from '../../../entities/quiz/question.entity';

@Injectable()
export class QuestionsTransactionsRepository {
  async findRandomQuestions(
    manager: EntityManager,
  ): Promise<Question[] | null> {
    return await manager
      .createQueryBuilder(Question, 'q')
      .where('q.published = true')
      .orderBy('RANDOM()')
      .take(5)
      .getMany();
  }
}
