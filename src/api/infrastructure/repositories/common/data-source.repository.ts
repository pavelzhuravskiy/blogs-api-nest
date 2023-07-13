import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeORMEntity } from '../../../../types/typeorm-entity';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class DataSourceRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  // ***** TypeORM data source manager SAVE *****
  async save(entity: TypeORMEntity): Promise<TypeORMEntity> {
    return this.dataSource.manager.save(entity);
  }
}
