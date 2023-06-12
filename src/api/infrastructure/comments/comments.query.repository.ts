import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { idIsValid } from '../../../helpers/id-is-valid';
import { CommentViewDto } from '../../dto/comments/view/comment.view.dto';
import { LikeStatus } from '../../../enums/like-status.enum';
import { Paginator } from '../../../helpers/pagination/_paginator';
import { CommentQueryDto } from '../../dto/comments/query/comment.query.dto';

@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findComments(
    query: CommentQueryDto,
    postId: string,
    userId: number,
  ): Promise<Paginator<CommentViewDto[]>> {
    if (!idIsValid(postId)) {
      return null;
    }

    const comments = await this.dataSource.query(
      `select c.id, content, "commentatorId", u.login, c."createdAt"
       from public.comments c
                left join public.users u on c."commentatorId" = u.id
       where "postId" = $1
         and "isBanned" = false
       order by "${query.sortBy}" ${query.sortDirection}
       limit ${query.pageSize} offset (${query.pageNumber} - 1) * ${query.pageSize}`,
      [postId],
    );

    const totalCount = await this.dataSource.query(
      `select count(*)
       from public.comments c
                left join public.users u on c."commentatorId" = u.id
       where "postId" = $1
         and "isBanned" = false;`,
      [postId],
    );

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: Number(totalCount[0].count),
      items: await this.commentsMapping(comments, userId),
    });
  }

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

    const mappedComments = await this.commentsMapping(comments, userId);
    return mappedComments[0];
  }

  private async commentsMapping(
    comments: any,
    userId: number,
  ): Promise<CommentViewDto[]> {
    return Promise.all(
      comments.map(async (c) => {
        const likesCounter = await this.dataSource.query(
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
          [c.id],
        );

        let likesCount;
        let dislikesCount;

        if (likesCounter.length === 0) {
          likesCount = 0;
          dislikesCount = 0;
        } else {
          likesCount = likesCounter[0].likesCount;
          dislikesCount = likesCounter[0].dislikesCount;
        }

        let status;

        const findStatus = await this.dataSource.query(
          `select "likeStatus"
           from comment_likes
           where "commentId" = $1
             and "userId" = $2;`,
          [c.id, userId],
        );

        if (findStatus.length === 0) {
          status = LikeStatus.None;
        } else {
          status = findStatus[0].likeStatus;
        }

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
      }),
    );
  }
}
