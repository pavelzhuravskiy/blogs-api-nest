import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Answer } from '../../../entities/quiz/answer.entity';

@Injectable()
export class AnswersRepository {
  constructor(
    @InjectRepository(Answer)
    private readonly answersRepository: Repository<Answer>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  // ***** TypeORM query runner transaction SAVE *****
  async queryRunnerSave(
    entity: Answer,
    queryRunnerManager: EntityManager,
  ): Promise<Answer> {
    return queryRunnerManager.save(entity);
  }
}
