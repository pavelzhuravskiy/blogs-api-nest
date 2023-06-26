import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Comment } from '../../../entities/comments/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  // ***** TypeORM data source manager SAVE *****
  async dataSourceSave(entity: Comment): Promise<Comment> {
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

  // ------------------------------------

  async findUserCommentLikeRecord(
    commentId: number,
    userId: number,
  ): Promise<number | null> {
    const comments = await this.dataSource.query(
      `select id
       from public.comment_likes
       where "commentId" = $1
         and "userId" = $2;`,
      [commentId, userId],
    );

    if (comments.length === 0) {
      return null;
    }

    return comments[0];
  }

  async createUserCommentLikeRecord(
    commentId: number,
    userId: number,
    likeStatus: string,
  ): Promise<number | null> {
    return this.dataSource.query(
      `insert into public.comment_likes("commentId", "userId", "likeStatus")
       values ($1, $2, $3)
       returning id;`,
      [commentId, userId, likeStatus],
    );
  }

  async updateLikeStatus(
    likeStatus: string,
    commentId: number,
    userId: number,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `update public.comment_likes
       set "likeStatus" = $1
       where "commentId" = $2
         and "userId" = $3`,
      [likeStatus, commentId, userId],
    );
    return result[1] === 1;
  }
}
