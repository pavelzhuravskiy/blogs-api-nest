import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Post } from '../../../entities/posts/post.entity';
import { PostLike } from '../../../entities/posts/post-like.entity';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post) private readonly postsRepository: Repository<Post>,
    @InjectRepository(PostLike)
    private readonly postLikesRepository: Repository<PostLike>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  // ***** Find post operations *****
  async findPost(postId: string): Promise<Post | null> {
    try {
      return await this.postsRepository
        .createQueryBuilder('p')
        .where(`p.id = :postId`, {
          postId: postId,
        })
        .getOne();
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  // ***** Delete post operations *****
  async deletePost(postId: number): Promise<boolean> {
    const result = await this.postsRepository
      .createQueryBuilder('p')
      .delete()
      .from(Post)
      .where('id = :postId', { postId: postId })
      .execute();
    return result.affected === 1;
  }

  // ***** Likes for post operations *****
  async findUserPostLikeRecord(
    postId: number,
    userId: number,
  ): Promise<PostLike | null> {
    return this.postLikesRepository
      .createQueryBuilder('pl')
      .leftJoinAndSelect('pl.post', 'p')
      .leftJoinAndSelect('pl.user', 'u')
      .where(`p.id = :postId`, {
        postId: postId,
      })
      .andWhere(`u.id = :userId`, {
        userId: userId,
      })
      .getOne();
  }
}
