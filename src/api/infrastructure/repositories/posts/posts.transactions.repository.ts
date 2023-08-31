import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Post } from '../../../entities/posts/post.entity';

@Injectable()
export class PostsTransactionsRepository {
  async findPostById(
    postId: string,
    manager: EntityManager,
  ): Promise<Post | null> {
    try {
      return await manager
        .createQueryBuilder(Post, 'p')
        .where(`p.id = :postId`, { postId: postId })
        .getOne();
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
