import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../../../entities/quiz/question.entity';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
  ) {}
  // ***** Find question operations *****
  async findQuestion(questionId: string): Promise<Question | null> {
    try {
      return await this.questionsRepository
        .createQueryBuilder('q')
        .where(`q.id = :questionId`, { questionId: questionId })
        .getOne();
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  // ***** Delete operations *****
  async deleteQuestion(questionId: string): Promise<boolean> {
    const result = await this.questionsRepository
      .createQueryBuilder('q')
      .delete()
      .from(Question)
      .where('id = :questionId', { questionId: questionId })
      .execute();
    return result.affected === 1;
  }
}
