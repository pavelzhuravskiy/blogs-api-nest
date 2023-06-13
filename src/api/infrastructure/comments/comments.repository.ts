import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentInputDto } from '../../dto/comments/input/comment.input.dto';
import { idIsValid } from '../../../helpers/id-is-valid';
import { Comment } from '../../entities/comments/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createComment(
    commentInputDto: CommentInputDto,
    userId: number,
    userLogin: string,
    postId: number,
  ): Promise<number> {
    return this.dataSource.transaction(async () => {
      const comment = await this.dataSource.query(
        `insert into public.comments(content, "commentatorId", "postId")
         values ($1, $2, $3)
         returning id;`,
        [commentInputDto.content, userId, postId],
      );

      return comment[0].id;
    });
  }

  async findComment(commentId: string): Promise<Comment | null> {
    if (!idIsValid(commentId)) {
      return null;
    }

    const comments = await this.dataSource.query(
      `select id, "commentatorId"
       from public.comments
       where id = $1;`,
      [commentId],
    );

    if (comments.length === 0) {
      return null;
    }

    return comments[0];
  }

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

  async updateComment(
    commentInputDto: CommentInputDto,
    commentId: number,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `update public.comments
       set "content" = $1
       where id = $2`,
      [commentInputDto.content, commentId],
    );
    return result[1] === 1;
  }

  async deleteComment(commentId: number): Promise<boolean> {
    const result = await this.dataSource.query(
      `delete
       from public.comments
       where id = $1;`,
      [commentId],
    );
    return result[1] === 1;
  }
}
