import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { QuizGame } from '../../../entities/quiz/quiz-game.entity';

@Injectable()
export class QuizGamesRepository {
  constructor(
    @InjectRepository(QuizGame)
    private readonly questionsRepository: Repository<QuizGame>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  // ***** TypeORM query runner transaction SAVE *****
  async queryRunnerSave(
    entity: QuizGame,
    queryRunnerManager: EntityManager,
  ): Promise<QuizGame> {
    return queryRunnerManager.save(entity);
  }
}
