import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { idIsValid } from '../../../helpers/id-is-valid';
import { CommentViewDto } from '../../dto/comments/view/comment.view.dto';
import { LikeStatus } from '../../../enums/like-status.enum';
import { Paginator } from '../../../helpers/pagination/_paginator';
import { CommentQueryDto } from '../../dto/comments/query/comment.query.dto';
import { Role } from '../../../enums/role.enum';

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

  async findCommentsOfBloggerPosts(
    query: CommentQueryDto,
    userId: number,
    role: string,
  ): Promise<Paginator<CommentViewDto[]>> {
    const comments = await this.dataSource.query(
      `select c.id,
              c.content    as "commentContent",
              u.id         as "commentatorId",
              u.login      as "commentatorLogin",
              u."isBanned" as "userIsBanned",
              c."createdAt",
              c."postId",
              p.title      as "postTitle",
              p."blogId"   as "blogId",
              b.name       as "blogName",
              bo."ownerId" as "blogOwnerId"
       from public.comments c
                left join public.users u on u.id = c."commentatorId"
                left join public.posts p on c."postId" = p.id
                left join public.blogs b on p."blogId" = b.id
                left join public.blog_owners bo on b.id = bo."blogId"
       where bo."ownerId" = $1
         and u."isBanned" = false`,
      [userId],
    );

    const totalCount = await this.dataSource.query(
      `select count(*)
       from public.comments c
                left join public.users u on u.id = c."commentatorId"
                left join public.posts p on c."postId" = p.id
                left join public.blogs b on p."blogId" = b.id
                left join public.blog_owners bo on b.id = bo."blogId"
       where bo."ownerId" = $1
         and u."isBanned" = false;`,
      [userId],
    );

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: Number(totalCount[0].count),
      items: await this.commentsMapping(comments, userId, role),
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
    role?: string,
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
           from public.comment_likes
           where "commentId" = $1
             and "userId" = $2;`,
          [c.id, userId],
        );

        if (findStatus.length === 0) {
          status = LikeStatus.None;
        } else {
          status = findStatus[0].likeStatus;
        }

        let output;

        if (role === Role.Blogger) {
          output = {
            id: c.id.toString(),
            content: c.commentContent,
            commentatorInfo: {
              userId: c.commentatorId.toString(),
              userLogin: c.commentatorLogin,
            },
            createdAt: c.createdAt,
            likesInfo: {
              likesCount: Number(likesCount),
              dislikesCount: Number(dislikesCount),
              myStatus: status,
            },
            postInfo: {
              id: c.postId.toString(),
              title: c.postTitle,
              blogId: c.blogId.toString(),
              blogName: c.blogName,
            },
          };
        } else {
          output = {
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
        }

        return output;
      }),
    );
  }
}
