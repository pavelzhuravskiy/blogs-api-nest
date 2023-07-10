import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { QuizPlayerProgress } from '../../../entities/quiz/progress.entity';

@Injectable()
export class QuizPlayerProgressesRepository {
  constructor(
    @InjectRepository(QuizPlayerProgress)
    private readonly questionsRepository: Repository<QuizPlayerProgress>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  // ***** TypeORM query runner transaction SAVE *****
  async queryRunnerSave(
    entity: QuizPlayerProgress,
    queryRunnerManager: EntityManager,
  ): Promise<QuizPlayerProgress> {
    return queryRunnerManager.save(entity);
  }
}
