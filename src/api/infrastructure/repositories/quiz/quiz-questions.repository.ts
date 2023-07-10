import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { QuizQuestion } from '../../../entities/quiz/question.entity';

@Injectable()
export class QuizQuestionsRepository {
  constructor(
    @InjectRepository(QuizQuestion)
    private readonly questionsRepository: Repository<QuizQuestion>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  // ***** TypeORM data source manager SAVE *****
  async dataSourceSave(entity: QuizQuestion): Promise<QuizQuestion> {
    return this.dataSource.manager.save(entity);
  }

  // ***** Find question operations *****
  async findQuestion(questionId: string): Promise<QuizQuestion | null> {
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
  async deleteQuestion(questionId: number): Promise<boolean> {
    const result = await this.questionsRepository
      .createQueryBuilder('q')
      .delete()
      .from(QuizQuestion)
      .where('id = :questionId', { questionId: questionId })
      .execute();
    return result.affected === 1;
  }
}
