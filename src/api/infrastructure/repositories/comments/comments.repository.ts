import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Comment } from '../../../entities/comments/comment.entity';
import { CommentLike } from '../../../entities/comments/comment-like.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(CommentLike)
    private readonly commentLikesRepository: Repository<CommentLike>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  // ***** Find comment *****
  async findComment(commentId: string): Promise<Comment | null> {
    try {
      return await this.commentsRepository
        .createQueryBuilder('c')
        .leftJoinAndSelect('c.user', 'u')
        .where(`c.id = :commentId`, {
          commentId: commentId,
        })
        .getOne();
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  // ***** Delete comment *****
  async deleteComment(commentId: string): Promise<boolean> {
    const result = await this.commentsRepository
      .createQueryBuilder('c')
      .delete()
      .from(Comment)
      .where('id = :commentId', { commentId: commentId })
      .execute();
    return result.affected === 1;
  }

  // ***** Likes for comments *****
  async findUserCommentLikeRecord(
    commentId: string,
    userId: string,
  ): Promise<CommentLike | null> {
    return this.commentLikesRepository
      .createQueryBuilder('cl')
      .leftJoinAndSelect('cl.comment', 'c')
      .leftJoinAndSelect('cl.user', 'u')
      .where(`c.id = :commentId`, {
        commentId: commentId,
      })
      .andWhere(`u.id = :userId`, {
        userId: userId,
      })
      .getOne();
  }
}
