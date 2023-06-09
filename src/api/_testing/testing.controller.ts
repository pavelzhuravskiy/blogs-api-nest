import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  @Delete('all-data')
  @HttpCode(204)
  async deleteAll() {
    await this.dataSource.query(
      `delete
       from public.devices;`,
    );
    await this.dataSource.query(
      `delete
       from public.users;`,
    );
    await this.dataSource.query(
      `delete
       from public.blogs;`,
    );
    await this.dataSource.query(
      `delete
       from public.posts;`,
    );
  }
}
