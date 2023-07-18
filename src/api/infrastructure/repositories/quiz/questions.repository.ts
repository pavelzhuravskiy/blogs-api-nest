import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Question } from '../../../entities/quiz/question.entity';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}
  // ***** Find question operations *****
  async findQuestion(questionId: string): Promise<Question | null> {
    try {
      return await this.questionsRepository
        .createQueryBuilder('q')
        .where(`q.id = :questionId`, { questionId: questionId })
        .getOne();
    } catch (e) {
      console.log(e);
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
