import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { idIsValid } from '../../../helpers/id-is-valid';
import { CommentViewDto } from '../../dto/comments/view/comment.view.dto';
import { LikeStatus } from '../../../enums/like-status.enum';

@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findComment(
    commentId: string | number,
    userId: number,
  ): Promise<CommentViewDto | null> {
    if (!idIsValid(commentId)) {
      return null;
    }

    const comments = await this.dataSource.query(
      `select c.id, content, "commentatorId", u.login, c."createdAt"
       from public.comments c
                left join public.users u on c."commentatorId" = u.id
       where c.id = $1`,
      [commentId],
    );

    const counter = await this.dataSource.query(
      `select "commentId",
              ( select count("likeStatus")
                from public.comment_likes
                         left join public.users u
                                   on u.id = public.comment_likes."userId"
                where "likeStatus" = 'Like'
                  and "commentId" = $1
                  and u."isBanned" = false )  as "likesCount",
              ( select count("likeStatus")
                from public.comment_likes
                         left join public.users u2
                                   on u2.id = public.comment_likes."userId"
                where "likeStatus" = 'Dislike'
                  and "commentId" = $1
                  and u2."isBanned" = false ) as "dislikesCount"
       from public.comment_likes
       where "commentId" = $1
       group by "commentId"`,
      [commentId],
    );

    const likesCount = counter[0].likesCount;
    const dislikesCount = counter[0].dislikesCount;
    let status;

    const findStatus = await this.dataSource.query(
      `select "likeStatus"
       from comment_likes
       where "commentId" = $1
         and "userId" = $2;`,
      [commentId, userId],
    );

    if (findStatus.length === 0) {
      status = LikeStatus.None;
    } else {
      status = findStatus[0].likeStatus;
    }

    const mappedComments = await this.commentsMapping(
      comments,
      likesCount,
      dislikesCount,
      status,
    );
    return mappedComments[0];
  }

  private async commentsMapping(
    comments: any,
    likesCount: string,
    dislikesCount: string,
    status: string,
  ): Promise<CommentViewDto[]> {
    return comments.map((c) => {
      return {
        id: c.id.toString(),
        content: c.content,
        commentatorInfo: {
          userId: c.commentatorId.toString(),
          userLogin: c.login,
        },
        createdAt: c.createdAt,
        likesInfo: {
          likesCount: Number(likesCount),
          dislikesCount: Number(dislikesCount),
          myStatus: status,
        },
      };
    });
  }
}
