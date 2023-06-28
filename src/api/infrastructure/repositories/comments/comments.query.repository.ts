import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CommentViewDto } from '../../../dto/comments/view/comment.view.dto';
import { LikeStatus } from '../../../../enums/like-status.enum';
import { Paginator } from '../../../../helpers/paginator';
import { CommentQueryDto } from '../../../dto/comments/query/comment.query.dto';
import { Comment } from '../../../entities/comments/comment.entity';
import { BloggerCommentViewDto } from '../../../dto/comments/view/blogger/blogger.comment.view.dto';
import { CommentLike } from '../../../entities/comments/comment-like.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async findComment(
    commentId: number,
    userId: number,
  ): Promise<CommentViewDto | null> {
    try {
      const comments = await this.commentsRepository
        .createQueryBuilder('c')
        .addSelect(
          (qb) =>
            qb
              .select(`count(*)`)
              .from(CommentLike, 'cl')
              .leftJoin('cl.user', 'u')
              .leftJoin('u.userBanBySA', 'ubsa')
              .where('cl.commentId = c.id')
              .andWhere('ubsa.isBanned = false')
              .andWhere(`cl.likeStatus = 'Like'`),
          'likes_count',
        )
        .addSelect(
          (qb) =>
            qb
              .select(`count(*)`)
              .from(CommentLike, 'cl')
              .leftJoin('cl.user', 'u')
              .leftJoin('u.userBanBySA', 'ubsa')
              .where('cl.commentId = c.id')
              .andWhere('ubsa.isBanned = false')
              .andWhere(`cl.likeStatus = 'Dislike'`),
          'dislikes_count',
        )
        .addSelect(
          (qb) =>
            qb
              .select('cl.likeStatus')
              .from(CommentLike, 'cl')
              .where('cl.commentId = c.id')
              .andWhere('cl.userId = :userId', { userId: userId }),
          'like_status',
        )
        .where(`c.id = :commentId`, {
          commentId: commentId,
        })
        .andWhere(`ubsa.isBanned = false`)
        .leftJoinAndSelect('c.user', 'u')
        .leftJoinAndSelect('u.userBanBySA', 'ubsa')
        .getRawMany();

      const mappedComments = await this.commentsMapping(comments);
      return mappedComments[0];
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findComments(
    query: CommentQueryDto,
    postId: string,
    userId: number,
  ): Promise<Paginator<CommentViewDto[]>> {
    try {
      const comments = await this.commentsRepository
        .createQueryBuilder('c')
        .addSelect(
          (qb) =>
            qb
              .select(`count(*)`)
              .from(CommentLike, 'cl')
              .leftJoin('cl.user', 'u')
              .leftJoin('u.userBanBySA', 'ubsa')
              .where('cl.commentId = c.id')
              .andWhere('ubsa.isBanned = false')
              .andWhere(`cl.likeStatus = 'Like'`),
          'likes_count',
        )
        .addSelect(
          (qb) =>
            qb
              .select(`count(*)`)
              .from(CommentLike, 'cl')
              .leftJoin('cl.user', 'u')
              .leftJoin('u.userBanBySA', 'ubsa')
              .where('cl.commentId = c.id')
              .andWhere('ubsa.isBanned = false')
              .andWhere(`cl.likeStatus = 'Dislike'`),
          'dislikes_count',
        )
        .addSelect(
          (qb) =>
            qb
              .select('cl.likeStatus')
              .from(CommentLike, 'cl')
              .where('cl.commentId = c.id')
              .andWhere('cl.userId = :userId', { userId: userId }),
          'like_status',
        )
        .where(`p.id = :postId`, {
          postId: postId,
        })
        .andWhere(`ubsa.isBanned = false`)
        .leftJoinAndSelect('c.post', 'p')
        .leftJoinAndSelect('c.user', 'u')
        .leftJoinAndSelect('u.userBanBySA', 'ubsa')
        .orderBy(`c.${query.sortBy}`, query.sortDirection)
        .limit(query.pageSize)
        .offset((query.pageNumber - 1) * query.pageSize)
        .getRawMany();

      const totalCount = await this.commentsRepository
        .createQueryBuilder('c')
        .where(`p.id = :postId`, {
          postId: postId,
        })
        .andWhere(`ubsa.isBanned = false`)
        .leftJoinAndSelect('c.post', 'p')
        .leftJoinAndSelect('c.user', 'u')
        .leftJoinAndSelect('u.userBanBySA', 'ubsa')
        .getCount();

      return Paginator.paginate({
        pageNumber: query.pageNumber,
        pageSize: query.pageSize,
        totalCount: totalCount,
        items: await this.commentsMapping(comments),
      });
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findCommentsOfBloggerPosts(
    query: CommentQueryDto,
    userId: number,
  ): Promise<Paginator<CommentViewDto[]>> {
    try {
      const comments = await this.commentsRepository
        .createQueryBuilder('c')
        .addSelect(
          (qb) =>
            qb
              .select(`count(*)`)
              .from(CommentLike, 'cl')
              .leftJoin('cl.user', 'u')
              .leftJoin('u.userBanBySA', 'ubsa')
              .where('cl.commentId = c.id')
              .andWhere('ubsa.isBanned = false')
              .andWhere(`cl.likeStatus = 'Like'`),
          'likes_count',
        )
        .addSelect(
          (qb) =>
            qb
              .select(`count(*)`)
              .from(CommentLike, 'cl')
              .leftJoin('cl.user', 'u')
              .leftJoin('u.userBanBySA', 'ubsa')
              .where('cl.commentId = c.id')
              .andWhere('ubsa.isBanned = false')
              .andWhere(`cl.likeStatus = 'Dislike'`),
          'dislikes_count',
        )
        .addSelect(
          (qb) =>
            qb
              .select('cl.likeStatus')
              .from(CommentLike, 'cl')
              .where('cl.commentId = c.id')
              .andWhere('cl.userId = :userId', { userId: userId }),
          'like_status',
        )
        .where(`bu.id = :userId`, {
          userId: userId,
        })
        .andWhere(`ubsa.isBanned = false`)
        .leftJoinAndSelect('c.post', 'p')
        .leftJoinAndSelect('c.user', 'u')
        .leftJoinAndSelect('p.blog', 'b')
        .leftJoinAndSelect('b.user', 'bu')
        .leftJoinAndSelect('bu.userBanBySA', 'ubsa')
        .orderBy(`c.${query.sortBy}`, query.sortDirection)
        .limit(query.pageSize)
        .offset((query.pageNumber - 1) * query.pageSize)
        .getRawMany();

      console.log(comments);

      const totalCount = await this.commentsRepository
        .createQueryBuilder('c')
        .where(`u.id = :userId`, {
          userId: userId,
        })
        .andWhere(`ubsa.isBanned = false`)
        .leftJoinAndSelect('c.post', 'p')
        .leftJoinAndSelect('p.blog', 'b')
        .leftJoinAndSelect('b.user', 'u')
        .leftJoinAndSelect('u.userBanBySA', 'ubsa')
        .getCount();

      return Paginator.paginate({
        pageNumber: query.pageNumber,
        pageSize: query.pageSize,
        totalCount: totalCount,
        items: await this.commentsOfBloggerMapping(comments),
      });
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  private async commentsMapping(comments: any[]): Promise<CommentViewDto[]> {
    return comments.map((c) => {
      return {
        id: c.c_id.toString(),
        content: c.c_content,
        commentatorInfo: {
          userId: c.u_id.toString(),
          userLogin: c.u_login,
        },
        createdAt: c.c_created_at,
        likesInfo: {
          likesCount: Number(c.likes_count),
          dislikesCount: Number(c.dislikes_count),
          myStatus: c.like_status || LikeStatus.None,
        },
      };
    });
  }

  private async commentsOfBloggerMapping(
    comments: any[],
  ): Promise<BloggerCommentViewDto[]> {
    return comments.map((c) => {
      return {
        id: c.c_id.toString(),
        content: c.c_content,
        createdAt: c.c_created_at,
        commentatorInfo: {
          userId: c.u_id.toString(),
          userLogin: c.u_login,
        },
        likesInfo: {
          likesCount: Number(c.likes_count),
          dislikesCount: Number(c.dislikes_count),
          myStatus: c.like_status || LikeStatus.None,
        },
        postInfo: {
          blogId: c.b_id.toString(),
          blogName: c.b_name,
          id: c.p_id.toString(),
          title: c.p_title,
        },
      };
    });
  }
}
