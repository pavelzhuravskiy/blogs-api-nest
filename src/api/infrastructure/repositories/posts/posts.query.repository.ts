import { Injectable } from '@nestjs/common';
import { PostViewDto } from '../../../dto/posts/view/post.view.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { LikeStatus } from '../../../../enums/like-status.enum';
import { PostQueryDto } from '../../../dto/posts/query/post.query.dto';
import { Post } from '../../../entities/posts/post.entity';
import { Paginator } from '../../../../helpers/paginator';
import { PostLike } from '../../../entities/posts/post-like.entity';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async findPost(postId: string, userId: number): Promise<PostViewDto | null> {
    try {
      const posts = await this.postsRepository
        .createQueryBuilder('p')
        .addSelect(
          (qb) =>
            qb
              .select(`count(*)`)
              .from(PostLike, 'pl')
              .leftJoin('pl.user', 'u')
              .leftJoin('u.userBanBySA', 'ubsa')
              .where('pl.postId = p.id')
              .andWhere('ubsa.isBanned = false')
              .andWhere(`pl.likeStatus = 'Like'`),
          'likes_count',
        )
        .addSelect(
          (qb) =>
            qb
              .select(`count(*)`)
              .from(PostLike, 'pl')
              .leftJoin('pl.user', 'u')
              .leftJoin('u.userBanBySA', 'ubsa')
              .where('pl.postId = p.id')
              .andWhere('ubsa.isBanned = false')
              .andWhere(`pl.likeStatus = 'Dislike'`),
          'dislikes_count',
        )
        .addSelect(
          (qb) =>
            qb
              .select('pl.likeStatus')
              .from(PostLike, 'pl')
              .where('pl.postId = p.id')
              .andWhere('pl.userId = :userId', { userId: userId }),
          'like_status',
        )
        .addSelect(
          (qb) =>
            qb
              .select(
                `jsonb_agg(json_build_object('addedAt', to_char(
            agg.added_at::timestamp at time zone 'UTC',
            'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'), 'userId', cast(agg.id as varchar), 'login', agg.login)
                 )`,
              )
              .from((qb) => {
                return qb
                  .select(`added_at, u.id, u.login`)
                  .from(PostLike, 'pl')
                  .leftJoin('pl.user', 'u')
                  .leftJoin('u.userBanBySA', 'ubsa')
                  .where('pl.postId = p.id')
                  .andWhere(`pl.like_status = 'Like'`)
                  .andWhere('ubsa.isBanned = false')
                  .orderBy('added_at', 'DESC')
                  .limit(3);
              }, 'agg'),

          'newest_likes',
        )
        .where(`p.id = :postId`, {
          postId: postId,
        })
        .andWhere(`bb.isBanned = false`)
        .andWhere(`ubsa.isBanned = false`)
        .leftJoinAndSelect('p.blog', 'b')
        .leftJoinAndSelect('b.blogBan', 'bb')
        .leftJoinAndSelect('b.user', 'u')
        .leftJoinAndSelect('u.userBanBySA', 'ubsa')
        .getRawMany();

      const mappedPosts = await this.postsMapping(posts);
      return mappedPosts[0];
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findPosts(
    query: PostQueryDto,
    userId: number,
  ): Promise<Paginator<PostViewDto[]>> {
    const posts = await this.postsRepository
      .createQueryBuilder('p')
      .addSelect(
        (qb) =>
          qb
            .select(`count(*)`)
            .from(PostLike, 'pl')
            .leftJoin('pl.user', 'u')
            .leftJoin('u.userBanBySA', 'ubsa')
            .where('pl.postId = p.id')
            .andWhere('ubsa.isBanned = false')
            .andWhere(`pl.likeStatus = 'Like'`),
        'likes_count',
      )
      .addSelect(
        (qb) =>
          qb
            .select(`count(*)`)
            .from(PostLike, 'pl')
            .leftJoin('pl.user', 'u')
            .leftJoin('u.userBanBySA', 'ubsa')
            .where('pl.postId = p.id')
            .andWhere('ubsa.isBanned = false')
            .andWhere(`pl.likeStatus = 'Dislike'`),
        'dislikes_count',
      )
      .addSelect(
        (qb) =>
          qb
            .select('pl.likeStatus')
            .from(PostLike, 'pl')
            .where('pl.postId = p.id')
            .andWhere('pl.userId = :userId', { userId: userId }),
        'like_status',
      )
      .addSelect(
        (qb) =>
          qb
            .select(
              `jsonb_agg(json_build_object('addedAt', to_char(
            agg.added_at::timestamp at time zone 'UTC',
            'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'), 'userId', cast(agg.id as varchar), 'login', agg.login)
                 )`,
            )
            .from((qb) => {
              return qb
                .select(`added_at, u.id, u.login`)
                .from(PostLike, 'pl')
                .leftJoin('pl.user', 'u')
                .leftJoin('u.userBanBySA', 'ubsa')
                .where('pl.postId = p.id')
                .andWhere(`pl.like_status = 'Like'`)
                .andWhere('ubsa.isBanned = false')
                .orderBy('added_at', 'DESC')
                .limit(3);
            }, 'agg'),

        'newest_likes',
      )
      .where(`bb.isBanned = false`)
      .andWhere(`ubsa.isBanned = false`)
      .leftJoinAndSelect('p.blog', 'b')
      .leftJoinAndSelect('b.blogBan', 'bb')
      .leftJoinAndSelect('b.user', 'u')
      .leftJoinAndSelect('u.userBanBySA', 'ubsa')
      .orderBy(
        `${query.sortBy === 'blogName' ? 'b.name' : `p.${query.sortBy}`}`,
        query.sortDirection,
      )
      .limit(query.pageSize)
      .offset((query.pageNumber - 1) * query.pageSize)
      .getRawMany();

    const totalCount = await this.postsRepository
      .createQueryBuilder('p')
      .where(`bb.isBanned = false`)
      .andWhere(`ubsa.isBanned = false`)
      .leftJoinAndSelect('p.blog', 'b')
      .leftJoinAndSelect('b.blogBan', 'bb')
      .leftJoinAndSelect('b.user', 'u')
      .leftJoinAndSelect('u.userBanBySA', 'ubsa')
      .getCount();

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: await this.postsMapping(posts),
    });
  }

  async findPostsForBlog(
    query: PostQueryDto,
    blogId: string,
    userId: number,
  ): Promise<Paginator<PostViewDto[]>> {
    try {
      const posts = await this.postsRepository
        .createQueryBuilder('p')
        .addSelect(
          (qb) =>
            qb
              .select(`count(*)`)
              .from(PostLike, 'pl')
              .leftJoin('pl.user', 'u')
              .leftJoin('u.userBanBySA', 'ubsa')
              .where('pl.postId = p.id')
              .andWhere('ubsa.isBanned = false')
              .andWhere(`pl.likeStatus = 'Like'`),
          'likes_count',
        )
        .addSelect(
          (qb) =>
            qb
              .select(`count(*)`)
              .from(PostLike, 'pl')
              .leftJoin('pl.user', 'u')
              .leftJoin('u.userBanBySA', 'ubsa')
              .where('pl.postId = p.id')
              .andWhere('ubsa.isBanned = false')
              .andWhere(`pl.likeStatus = 'Dislike'`),
          'dislikes_count',
        )
        .addSelect(
          (qb) =>
            qb
              .select('pl.likeStatus')
              .from(PostLike, 'pl')
              .where('pl.postId = p.id')
              .andWhere('pl.userId = :userId', { userId: userId }),
          'like_status',
        )
        .addSelect(
          (qb) =>
            qb
              .select(
                `jsonb_agg(json_build_object('addedAt', to_char(
            agg.added_at::timestamp at time zone 'UTC',
            'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'), 'userId', cast(agg.id as varchar), 'login', agg.login)
                 )`,
              )
              .from((qb) => {
                return qb
                  .select(`added_at, u.id, u.login`)
                  .from(PostLike, 'pl')
                  .leftJoin('pl.user', 'u')
                  .leftJoin('u.userBanBySA', 'ubsa')
                  .where('pl.postId = p.id')
                  .andWhere(`pl.like_status = 'Like'`)
                  .andWhere('ubsa.isBanned = false')
                  .orderBy('added_at', 'DESC')
                  .limit(3);
              }, 'agg'),

          'newest_likes',
        )
        .where(`b.id = :blogId`, {
          blogId: blogId,
        })
        .andWhere(`bb.isBanned = false`)
        .andWhere(`ubsa.isBanned = false`)
        .leftJoinAndSelect('p.blog', 'b')
        .leftJoinAndSelect('b.blogBan', 'bb')
        .leftJoinAndSelect('b.user', 'u')
        .leftJoinAndSelect('u.userBanBySA', 'ubsa')
        .orderBy(`p.${query.sortBy}`, query.sortDirection)
        .limit(query.pageSize)
        .offset((query.pageNumber - 1) * query.pageSize)
        .getRawMany();

      const totalCount = await this.postsRepository
        .createQueryBuilder('p')
        .where(`b.id = :blogId`, {
          blogId: blogId,
        })
        .andWhere(`bb.isBanned = false`)
        .andWhere(`ubsa.isBanned = false`)
        .leftJoinAndSelect('p.blog', 'b')
        .leftJoinAndSelect('b.blogBan', 'bb')
        .leftJoinAndSelect('b.user', 'u')
        .leftJoinAndSelect('u.userBanBySA', 'ubsa')
        .getCount();

      return Paginator.paginate({
        pageNumber: query.pageNumber,
        pageSize: query.pageSize,
        totalCount: totalCount,
        items: await this.postsMapping(posts),
      });
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  private async postsMapping(posts: any[]): Promise<PostViewDto[]> {
    return posts.map((p) => {
      return {
        id: p.p_id.toString(),
        title: p.p_title,
        shortDescription: p.p_short_description,
        content: p.p_content,
        blogId: p.b_id.toString(),
        blogName: p.b_name,
        createdAt: p.p_created_at,
        extendedLikesInfo: {
          likesCount: Number(p.likes_count),
          dislikesCount: Number(p.dislikes_count),
          myStatus: p.like_status || LikeStatus.None,
          newestLikes: p.newest_likes || [],
        },
      };
    });
  }
}
