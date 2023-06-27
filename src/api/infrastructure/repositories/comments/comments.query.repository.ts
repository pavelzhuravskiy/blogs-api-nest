import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CommentViewDto } from '../../../dto/comments/view/comment.view.dto';
import { LikeStatus } from '../../../../enums/like-status.enum';
import { Paginator } from '../../../../helpers/paginator';
import { CommentQueryDto } from '../../../dto/comments/query/comment.query.dto';
import { Comment } from '../../../entities/comments/comment.entity';
import { BloggerCommentViewDto } from '../../../dto/comments/view/blogger/blogger.comment.view.dto';

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
        .where(`c.id = :commentId`, {
          commentId: commentId,
        })
        .andWhere(`ubsa.isBanned = false`)
        .leftJoinAndSelect('c.user', 'u')
        .leftJoinAndSelect('u.userBanBySA', 'ubsa')
        .getMany();

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
        .where(`p.id = :postId`, {
          postId: postId,
        })
        .andWhere(`ubsa.isBanned = false`)
        .leftJoinAndSelect('c.post', 'p')
        .leftJoinAndSelect('c.user', 'u')
        .leftJoinAndSelect('u.userBanBySA', 'ubsa')
        .orderBy(`c.${query.sortBy}`, query.sortDirection)
        .skip((query.pageNumber - 1) * query.pageSize)
        .take(query.pageSize)
        .getMany();

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
        .where(`u.id = :userId`, {
          userId: userId,
        })
        .andWhere(`ubsa.isBanned = false`)
        .leftJoinAndSelect('c.post', 'p')
        .leftJoinAndSelect('p.blog', 'b')
        .leftJoinAndSelect('b.user', 'u')
        .leftJoinAndSelect('u.userBanBySA', 'ubsa')
        .orderBy(`c.${query.sortBy}`, query.sortDirection)
        .skip((query.pageNumber - 1) * query.pageSize)
        .take(query.pageSize)
        .getMany();

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

  private async commentsMapping(
    comments: Comment[],
  ): Promise<CommentViewDto[]> {
    return comments.map((c) => {
      return {
        id: c.id.toString(),
        content: c.content,
        commentatorInfo: {
          userId: c.user.id.toString(),
          userLogin: c.user.login,
        },
        createdAt: c.createdAt,
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatus.None,
        },
      };
    });
  }

  private async commentsOfBloggerMapping(
    comments: Comment[],
  ): Promise<BloggerCommentViewDto[]> {
    return comments.map((c) => {
      return {
        id: c.id.toString(),
        content: c.content,
        createdAt: c.createdAt,
        commentatorInfo: {
          userId: c.post.blog.user.id.toString(),
          userLogin: c.post.blog.user.login,
        },
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatus.None,
        },
        postInfo: {
          blogId: c.post.blog.id.toString(),
          blogName: c.post.blog.name,
          id: c.post.id.toString(),
          title: c.post.title,
        },
      };
    });
  }
}
