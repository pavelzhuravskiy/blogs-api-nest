import { Injectable } from '@nestjs/common';
import { PostViewDto } from '../../../dto/posts/view/post.view.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LikeStatus } from '../../../../enums/like-status.enum';
import { PostQueryDto } from '../../../dto/posts/query/post.query.dto';
import { Post } from '../../../entities/posts/post.entity';
import { Paginator } from '../../../../helpers/paginator';
import { PostLike } from '../../../entities/posts/post-like.entity';
import { PostMainImage } from '../../../entities/posts/post-image-main.entity';
import process from 'process';
import { PostImagesViewDto } from '../../../dto/posts/view/post-images.view.dto';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async findPost(postId: string, userId: string): Promise<PostViewDto | null> {
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
        .addSelect(
          (qb) =>
            qb
              .select(
                `jsonb_agg(json_build_object('url', agg.url, 'width', agg.width, 'height', agg.height, 'size', agg.size)
                 )`,
              )
              .from((qb) => {
                return qb
                  .select(`url, width, height, size`)
                  .from(PostMainImage, 'pmi')
                  .where('pmi.postId = p.id');
              }, 'agg'),

          'main_images',
        )
        .leftJoin('p.postMainImages', 'pmi')
        .leftJoinAndSelect('p.blog', 'b')
        .leftJoinAndSelect('b.blogBan', 'bb')
        .leftJoinAndSelect('b.user', 'u')
        .leftJoinAndSelect('u.userBanBySA', 'ubsa')
        .where(`p.id = :postId`, {
          postId: postId,
        })
        .andWhere(`bb.isBanned = false`)
        .andWhere(`ubsa.isBanned = false`)
        .groupBy(`p.id, b.id, bb.id, u.id, ubsa.id`)
        .getRawMany();

      const mappedPosts = await this.postsMapping(posts);
      return mappedPosts[0];
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async findPosts(
    query: PostQueryDto,
    userId: string,
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
      .addSelect(
        (qb) =>
          qb
            .select(
              `jsonb_agg(json_build_object('url', agg.url, 'width', agg.width, 'height', agg.height, 'size', agg.size)
                 )`,
            )
            .from((qb) => {
              return qb
                .select(`url, width, height, size`)
                .from(PostMainImage, 'pmi')
                .where('pmi.postId = p.id');
            }, 'agg'),

        'main_images',
      )
      .leftJoin('p.postMainImages', 'pmi')
      .leftJoinAndSelect('p.blog', 'b')
      .leftJoinAndSelect('b.blogBan', 'bb')
      .leftJoinAndSelect('b.user', 'u')
      .leftJoinAndSelect('u.userBanBySA', 'ubsa')
      .where(`bb.isBanned = false`)
      .andWhere(`ubsa.isBanned = false`)
      .orderBy(
        `${query.sortBy === 'blogName' ? 'b.name' : `p.${query.sortBy}`}`,
        query.sortDirection,
      )
      .limit(query.pageSize)
      .offset((query.pageNumber - 1) * query.pageSize)
      .groupBy(`p.id, b.id, bb.id, u.id, ubsa.id`)
      .getRawMany();

    const totalCount = await this.postsRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.blog', 'b')
      .leftJoinAndSelect('b.blogBan', 'bb')
      .leftJoinAndSelect('b.user', 'u')
      .leftJoinAndSelect('u.userBanBySA', 'ubsa')
      .where(`bb.isBanned = false`)
      .andWhere(`ubsa.isBanned = false`)
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
    userId: string,
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
        .addSelect(
          (qb) =>
            qb
              .select(
                `jsonb_agg(json_build_object('url', agg.url, 'width', agg.width, 'height', agg.height, 'size', agg.size)
                 )`,
              )
              .from((qb) => {
                return qb
                  .select(`url, width, height, size`)
                  .from(PostMainImage, 'pmi')
                  .where('pmi.postId = p.id');
              }, 'agg'),

          'main_images',
        )
        .leftJoin('p.postMainImages', 'pmi')
        .leftJoinAndSelect('p.blog', 'b')
        .leftJoinAndSelect('b.blogBan', 'bb')
        .leftJoinAndSelect('b.user', 'u')
        .leftJoinAndSelect('u.userBanBySA', 'ubsa')
        .where(`b.id = :blogId`, {
          blogId: blogId,
        })
        .andWhere(`bb.isBanned = false`)
        .andWhere(`ubsa.isBanned = false`)
        .orderBy(`p.${query.sortBy}`, query.sortDirection)
        .limit(query.pageSize)
        .offset((query.pageNumber - 1) * query.pageSize)
        .groupBy(`p.id, b.id, bb.id, u.id, ubsa.id`)
        .getRawMany();

      if (posts.length === 0) {
        return null;
      }

      const totalCount = await this.postsRepository
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.blog', 'b')
        .leftJoinAndSelect('b.blogBan', 'bb')
        .leftJoinAndSelect('b.user', 'u')
        .leftJoinAndSelect('u.userBanBySA', 'ubsa')
        .where(`b.id = :blogId`, {
          blogId: blogId,
        })
        .andWhere(`bb.isBanned = false`)
        .andWhere(`ubsa.isBanned = false`)
        .getCount();

      return Paginator.paginate({
        pageNumber: query.pageNumber,
        pageSize: query.pageSize,
        totalCount: totalCount,
        items: await this.postsMapping(posts),
      });
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async findPostImages(postId: string): Promise<PostImagesViewDto> {
    try {
      const posts = await this.postsRepository
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.postMainImages', 'pmi')
        .where(`p.id = :postId`, {
          postId: postId,
        })
        .getMany();

      const mappedPosts = await this.postImagesMapping(posts);
      return mappedPosts[0];
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  private async postImagesMapping(posts: Post[]): Promise<PostImagesViewDto[]> {
    return posts.map((p) => {
      return {
        main: p.postMainImages.map((bmi) => {
          return {
            url: process.env.S3_DOMAIN + bmi.url,
            width: Number(bmi.width),
            height: Number(bmi.height),
            fileSize: Number(bmi.size),
          };
        }),
      };
    });
  }

  private async postsMapping(posts: any[]): Promise<PostViewDto[]> {
    return posts.map((p) => {
      let mainImages = [];

      if (p.main_images) {
        mainImages = p.main_images.map((pmi) => {
          return {
            url: process.env.S3_DOMAIN + pmi.url,
            width: Number(pmi.width),
            height: Number(pmi.height),
            fileSize: Number(pmi.size),
          };
        });
      }

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
        images: {
          main: mainImages,
        },
      };
    });
  }
}
