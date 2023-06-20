import { Injectable } from '@nestjs/common';
import { PostViewDto } from '../../dto/posts/view/post.view.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikeStatus } from '../../../enums/like-status.enum';
import { PostQueryDto } from '../../dto/posts/query/post.query.dto';
import { idIsValid } from '../../../helpers/id-is-valid';
import { Paginator } from '../../../helpers/paginator';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findPosts(
    query: PostQueryDto,
    userId: number,
  ): Promise<Paginator<PostViewDto[]>> {
    const posts = await this.dataSource.query(
      `select p.id,
              p.title,
              p."shortDescription",
              p.content,
              b.id                                        as "blogId",
              b.name                                      as "blogName",
              b."isBanned",
              p."createdAt",
              ( select count("likeStatus")
                from public.post_likes
                         left join public.users u
                                   on u.id = public.post_likes."userId"
                where "likeStatus" = 'Like'
                  and "postId" = p.id
                  and u."isBanned" = false )              as "likesCount",
              ( select count("likeStatus")
                from public.post_likes
                         left join public.users u
                                   on u.id = public.post_likes."userId"
                where "likeStatus" = 'Dislike'
                  and "postId" = p.id
                  and u."isBanned" = false )              as "dislikesCount",
              ( select "likeStatus"
                from public.post_likes
                where "postId" = p.id and "userId" = $1 ) as "likeStatus",
              ( select jsonb_agg(json_build_object('addedAt', to_char(
                          agg."addedAt"::timestamp at time zone 'UTC',
                          'YYYY-MM-DD"T"HH24:MI:SS"Z"'), 'userId', agg.id,
                                                   'login', agg.login)
                                 order by "addedAt" desc)
                from ( select "addedAt", u.id, u.login
                       from post_likes
                                left join users u on u.id = post_likes."userId"
                       where "postId" = p.id
                         and "likeStatus" = 'Like'
                         and u."isBanned" = false
                       order by "addedAt" desc
                       limit 3 ) as agg )                 as "newestLikes"
       from public.posts p
                left join public.blogs b on b.id = p."blogId"
       where "isBanned" = false
       order by "${query.sortBy}" ${query.sortDirection}
       limit ${query.pageSize} offset (${query.pageNumber} - 1) * ${query.pageSize}`,
      [userId],
    );

    console.log(posts);

    const totalCount = await this.dataSource.query(
      `select count(*)
       from public.posts p
                left join public.blogs b on b.id = p."blogId"
       where "isBanned" = false`,
    );

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: Number(totalCount[0].count),
      items: await this.postsMapping(posts),
    });
  }

  async findPostsForBlog(
    query: PostQueryDto,
    blogId: string,
    userId: number,
  ): Promise<Paginator<PostViewDto[]>> {
    if (!idIsValid(blogId)) {
      return null;
    }

    const posts = await this.dataSource.query(
      `select p.id,
              p.title,
              p."shortDescription",
              p.content,
              b.id                                        as "blogId",
              b.name                                      as "blogName",
              b."isBanned",
              p."createdAt",
              ( select count("likeStatus")
                from public.post_likes
                         left join public.users u
                                   on u.id = public.post_likes."userId"
                where "likeStatus" = 'Like'
                  and "postId" = p.id
                  and u."isBanned" = false )              as "likesCount",
              ( select count("likeStatus")
                from public.post_likes
                         left join public.users u
                                   on u.id = public.post_likes."userId"
                where "likeStatus" = 'Dislike'
                  and "postId" = p.id
                  and u."isBanned" = false )              as "dislikesCount",
              ( select "likeStatus"
                from public.post_likes
                where "postId" = p.id and "userId" = $2 ) as "likeStatus",
              ( select jsonb_agg(json_build_object('addedAt', to_char(
                          agg."addedAt"::timestamp at time zone 'UTC',
                          'YYYY-MM-DD"T"HH24:MI:SS"Z"'), 'userId', agg.id,
                                                   'login', agg.login)
                                 order by "addedAt" desc)
                from ( select "addedAt", u.id, u.login
                       from post_likes
                                left join users u on u.id = post_likes."userId"
                       where "postId" = p.id
                         and "likeStatus" = 'Like'
                         and u."isBanned" = false
                       order by "addedAt" desc
                       limit 3 ) as agg )                 as "newestLikes"
       from public.posts p
                left join public.blogs b on b.id = p."blogId"
       where "blogId" = $1
         and "isBanned" = false
       order by "${query.sortBy}" ${query.sortDirection}
       limit ${query.pageSize} offset (${query.pageNumber} - 1) * ${query.pageSize}`,
      [blogId, userId],
    );

    const totalCount = await this.dataSource.query(
      `select count(*)
       from public.posts p
                left join public.blogs b on b.id = p."blogId"
       where "blogId" = $1
         and "isBanned" = false;`,
      [blogId],
    );

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: Number(totalCount[0].count),
      items: await this.postsMapping(posts),
    });
  }

  async findPost(postId: string, userId: number): Promise<PostViewDto | null> {
    if (!idIsValid(postId)) {
      return null;
    }

    const posts = await this.dataSource.query(
      `select p.id,
              p.title,
              p."shortDescription",
              p.content,
              b.id                                        as "blogId",
              b.name                                      as "blogName",
              b."isBanned",
              p."createdAt",
              ( select count("likeStatus")
                from public.post_likes
                         left join public.users u
                                   on u.id = public.post_likes."userId"
                where "likeStatus" = 'Like'
                  and "postId" = p.id
                  and u."isBanned" = false )              as "likesCount",
              ( select count("likeStatus")
                from public.post_likes
                         left join public.users u
                                   on u.id = public.post_likes."userId"
                where "likeStatus" = 'Dislike'
                  and "postId" = p.id
                  and u."isBanned" = false )              as "dislikesCount",
              ( select "likeStatus"
                from public.post_likes
                where "postId" = p.id and "userId" = $2 ) as "likeStatus",
              ( select jsonb_agg(json_build_object('addedAt', to_char(
                          agg."addedAt"::timestamp at time zone 'UTC',
                          'YYYY-MM-DD"T"HH24:MI:SS"Z"'), 'userId', agg.id,
                                                   'login', agg.login)
                                 order by "addedAt" desc)
                from ( select "addedAt", u.id, u.login
                       from post_likes
                                left join users u on u.id = post_likes."userId"
                       where "postId" = p.id
                         and "likeStatus" = 'Like'
                         and u."isBanned" = false
                       order by "addedAt" desc
                       limit 3 ) as agg )                 as "newestLikes"
       from public.posts p
                left join public.blogs b on b.id = p."blogId"
       where p.id = $1
         and "isBanned" = false`,
      [postId, userId],
    );

    const mappedPosts = await this.postsMapping(posts);
    return mappedPosts[0];
  }

  private async postsMapping(posts: any): Promise<PostViewDto[]> {
    return posts.map((p) => {
      let nls = p.newestLikes;

      if (!nls) {
        nls = [];
      }

      return {
        id: p.id.toString(),
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        blogId: p.blogId.toString(),
        blogName: p.blogName,
        createdAt: p.createdAt,
        extendedLikesInfo: {
          likesCount: Number(p.likesCount),
          dislikesCount: Number(p.dislikesCount),
          myStatus: p.likeStatus || LikeStatus.None,
          newestLikes: nls.map((nl) => {
            return {
              addedAt: nl.addedAt,
              userId: nl.userId.toString(),
              login: nl.login,
            };
          }),
        },
      };
    });
  }
}
