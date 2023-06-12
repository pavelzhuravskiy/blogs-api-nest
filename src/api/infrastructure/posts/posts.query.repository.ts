import { Injectable } from '@nestjs/common';
import { PostViewDto } from '../../dto/posts/view/post.view.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikeStatus } from '../../../enums/like-status.enum';
import { Paginator } from '../../../helpers/pagination/_paginator';
import { PostQueryDto } from '../../dto/posts/query/post.query.dto';
import { idIsValid } from '../../../helpers/id-is-valid';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async findPosts(query: PostQueryDto): Promise<Paginator<PostViewDto[]>> {
    const posts = await this.dataSource.query(
      `select p.id as "postId",
              p.title,
              p."shortDescription",
              p.content,
              b.id as "blogId",
              b.name as "blogName",
              b."isBanned",
              p."createdAt"
       from public.posts p
                left join public.blogs b on b.id = p."blogId"
       where "isBanned" = false
       order by "${query.sortBy}" ${query.sortDirection}
       limit ${query.pageSize} offset (${query.pageNumber} - 1) * ${query.pageSize}`,
    );

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
  ): Promise<Paginator<PostViewDto[]>> {
    if (!idIsValid(blogId)) {
      return null;
    }

    const posts = await this.dataSource.query(
      `select p.id as "postId",
              p.title,
              p."shortDescription",
              p.content,
              b.id as "blogId",
              b.name as "blogName",
              b."isBanned",
              p."createdAt"
       from public.posts p
                left join public.blogs b on b.id = p."blogId"
       where "blogId" = $1 and "isBanned" = false 
       order by "${query.sortBy}" ${query.sortDirection}
       limit ${query.pageSize} offset (${query.pageNumber} - 1) * ${query.pageSize}`,
      [blogId],
    );

    const totalCount = await this.dataSource.query(
      `select count(*)
       from public.posts p
                left join public.blogs b on b.id = p."blogId"
       where "blogId" = $1 and "isBanned" = false;`,
      [blogId],
    );

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: Number(totalCount[0].count),
      items: await this.postsMapping(posts),
    });
  }

  async findPost(postId: string): Promise<PostViewDto | null> {
    if (!idIsValid(postId)) {
      return null;
    }

    const posts = await this.dataSource.query(
      `select p.id as "postId",
              p.title,
              p."shortDescription",
              p.content,
              b.id as "blogId",
              b.name as "blogName",
              b."isBanned",
              p."createdAt"
       from public.posts p
                left join public.blogs b on b.id = p."blogId"
       where p.id = $1 and "isBanned" = false`,
      [postId],
    );

    const mappedPosts = await this.postsMapping(posts);
    return mappedPosts[0];
  }

  private async postsMapping(posts: any): Promise<PostViewDto[]> {
    return posts.map((p) => {
      return {
        id: p.postId.toString(),
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        blogId: p.blogId.toString(),
        blogName: p.blogName,
        createdAt: p.createdAt,
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatus.None,
          newestLikes: [],
        },
      };
    });
  }
}
