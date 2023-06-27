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

  // ***** TypeORM data source manager SAVE *****
  async dataSourceSave(
    entity: Comment | CommentLike,
  ): Promise<Comment | CommentLike> {
    return this.dataSource.manager.save(entity);
  }

  // ***** Find comment operations *****
  async findComment(commentId: string): Promise<Comment | null> {
    try {
      return await this.commentsRepository
        .createQueryBuilder('c')
        .where(`c.id = :commentId`, {
          commentId: commentId,
        })
        .leftJoinAndSelect('c.user', 'u')
        .getOne();
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  // ***** Delete comment operations *****
  async deleteComment(commentId: number): Promise<boolean> {
    const result = await this.commentsRepository
      .createQueryBuilder('c')
      .delete()
      .from(Comment)
      .where('id = :commentId', { commentId: commentId })
      .execute();
    return result.affected === 1;
  }

  // ***** Likes for comment operations *****
  async findUserCommentLikeRecord(
    commentId: number,
    userId: number,
  ): Promise<CommentLike | null> {
    return this.commentLikesRepository
      .createQueryBuilder('cl')
      .where(`c.id = :commentId`, {
        commentId: commentId,
      })
      .andWhere(`u.id = :userId`, {
        userId: userId,
      })
      .leftJoinAndSelect('cl.comment', 'c')
      .leftJoinAndSelect('cl.user', 'u')
      .getOne();
  }
}
