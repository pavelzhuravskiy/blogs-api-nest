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

  /*// ***** TypeORM query runner transaction SAVE *****
  async queryRunnerSave(
    entity: Blog | BlogBan,
    queryRunnerManager: EntityManager,
  ): Promise<Blog | BlogBan> {
    return queryRunnerManager.save(entity);
  }*/

  // ***** TypeORM data source manager SAVE *****
  async dataSourceSave(entity: Question): Promise<Question> {
    return this.dataSource.manager.save(entity);
  }

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

  /*async findBlogWithOwner(blogId: string): Promise<Blog | null> {
    try {
      return await this.blogsRepository
        .createQueryBuilder('b')
        .where(`b.id = :blogId`, { blogId: blogId })
        .leftJoinAndSelect('b.user', 'u')
        .getOne();
    } catch (e) {
      console.log(e);
      return null;
    }
  }*/

  /*async findBlogForBlogBan(blogId: string): Promise<Blog | null> {
    try {
      return await this.blogsRepository
        .createQueryBuilder('b')
        .where(`b.id = :blogId`, { blogId: blogId })
        .leftJoinAndSelect('b.blogBan', 'bb')
        .getOne();
    } catch (e) {
      console.log(e);
      return null;
    }
  }*/

  /*// ***** Delete operations *****
  async deleteBlog(blogId: number): Promise<boolean> {
    const result = await this.blogsRepository
      .createQueryBuilder('b')
      .delete()
      .from(Blog)
      .where('id = :blogId', { blogId: blogId })
      .execute();
    return result.affected === 1;
  }*/
}
