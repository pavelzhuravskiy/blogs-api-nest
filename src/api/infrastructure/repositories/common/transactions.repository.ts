import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { TypeORMEntity } from '../../../../types/typeorm-entity';

@Injectable()
export class TransactionsRepository {
  // ***** TypeORM query runner transaction SAVE *****
  async save(
    entity: TypeORMEntity,
    manager: EntityManager,
  ): Promise<TypeORMEntity> {
    return manager.save(entity);
  }
}
