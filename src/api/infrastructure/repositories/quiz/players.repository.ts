import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Player } from '../../../entities/quiz/player.entity';

@Injectable()
export class PlayersRepository {
  constructor(
    @InjectRepository(Player)
    private readonly questionsRepository: Repository<Player>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  // ***** TypeORM query runner transaction SAVE *****
  async queryRunnerSave(
    entity: Player,
    queryRunnerManager: EntityManager,
  ): Promise<Player> {
    return queryRunnerManager.save(entity);
  }

  // ***** TypeORM data source manager SAVE *****
  async dataSourceSave(entity: Player): Promise<Player> {
    return this.dataSource.manager.save(entity);
  }
}
