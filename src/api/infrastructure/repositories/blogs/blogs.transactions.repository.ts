import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Blog } from '../../../entities/blogs/blog.entity';

@Injectable()
export class BlogsTransactionsRepository {
  async findBlogWithOwner(
    blogId: string,
    manager: EntityManager,
  ): Promise<Blog | null> {
    try {
      return await manager
        .createQueryBuilder(Blog, 'b')
        .leftJoinAndSelect('b.user', 'u')
        .where(`b.id = :blogId`, { blogId: blogId })
        .getOne();
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
