import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { idIsValid } from '../../../helpers/id-is-valid';
import { CommentViewDto } from '../../dto/comments/view/comment.view.dto';
import { LikeStatus } from '../../../enums/like-status.enum';
import { Paginator } from '../../../helpers/_paginator';
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
      `select c.id,
              content,
              "commentatorId",
              u.login,
              c."createdAt",
              ( select count("likeStatus")
                from public.comment_likes
                         left join public.users u
                                   on u.id = public.comment_likes."userId"
                where "likeStatus" = 'Like'
                  and "commentId" = c.id
                  and u."isBanned" = false ) as "likesCount",
              ( select count("likeStatus")
                from public.comment_likes
                         left join public.users u
                                   on u.id = public.comment_likes."userId"
                where "likeStatus" = 'Dislike'
                  and "commentId" = c.id
                  and u."isBanned" = false ) as "dislikesCount",
              ( select "likeStatus"
                from public.comment_likes
                where "commentId" = c.id
                  and "userId" = $2 )        as "likeStatus"
       from public.comments c
                left join public.users u on c."commentatorId" = u.id
       where "postId" = $1
         and "isBanned" = false
       order by "${query.sortBy}" ${query.sortDirection}
       limit ${query.pageSize} offset (${query.pageNumber} - 1) * ${query.pageSize}`,
      [postId, userId],
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
      items: await this.commentsMapping(comments),
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
              bo."ownerId" as "blogOwnerId",
              ( select count("likeStatus")
                from public.comment_likes
                         left join public.users u
                                   on u.id = public.comment_likes."userId"
                where "likeStatus" = 'Like'
                  and "commentId" = c.id
                  and u."isBanned" = false ) as "likesCount",
              ( select count("likeStatus")
                from public.comment_likes
                         left join public.users u
                                   on u.id = public.comment_likes."userId"
                where "likeStatus" = 'Dislike'
                  and "commentId" = c.id
                  and u."isBanned" = false ) as "dislikesCount",
              ( select "likeStatus"
                from public.comment_likes
                where "commentId" = c.id
                  and "userId" = $1 )        as "likeStatus"
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
      items: await this.commentsMapping(comments, role),
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
      `select c.id,
              content,
              "commentatorId",
              u.login,
              c."createdAt",
              ( select count("likeStatus")
                from public.comment_likes
                         left join public.users u
                                   on u.id = public.comment_likes."userId"
                where "likeStatus" = 'Like'
                  and "commentId" = c.id
                  and u."isBanned" = false ) as "likesCount",
              ( select count("likeStatus")
                from public.comment_likes
                         left join public.users u
                                   on u.id = public.comment_likes."userId"
                where "likeStatus" = 'Dislike'
                  and "commentId" = c.id
                  and u."isBanned" = false ) as "dislikesCount",
              ( select "likeStatus"
                from public.comment_likes
                where "commentId" = c.id
                  and "userId" = $2 )        as "likeStatus"
       from public.comments c
                left join public.users u on c."commentatorId" = u.id
       where c.id = $1
         and "isBanned" = false`,
      [commentId, userId],
    );

    const mappedComments = await this.commentsMapping(comments);
    return mappedComments[0];
  }

  private async commentsMapping(
    comments: any,
    role?: string,
  ): Promise<CommentViewDto[]> {
    return comments.map((c) => {
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
            likesCount: Number(c.likesCount),
            dislikesCount: Number(c.dislikesCount),
            myStatus: c.likeStatus || LikeStatus.None,
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
            likesCount: Number(c.likesCount),
            dislikesCount: Number(c.dislikesCount),
            myStatus: c.likeStatus || LikeStatus.None,
          },
        };
      }

      return output;
    });
  }
}
