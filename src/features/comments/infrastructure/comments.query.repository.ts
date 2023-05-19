import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Paginator } from '../../../helpers/pagination/_paginator';
import { Comment, CommentLeanType, CommentModelType } from '../comment.entity';
import { CommentViewDto } from '../dto/comment.view.dto';
import { QueryDto } from '../../_shared/dto/query.dto';
import { pFind } from '../../../helpers/pagination/pagination-find';
import { pSort } from '../../../helpers/pagination/pagination-sort';
import { pFilterComments } from '../../../helpers/pagination/pagination-filter-comments';
import { likeStatusFinder } from '../../likes/helpers/like-status-finder';
import { PostsRepository } from '../../posts/infrastructure/posts.repository';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    private postsRepository: PostsRepository,
  ) {}
  async findComments(
    query: QueryDto,
    postId: string,
    userId: string,
  ): Promise<Paginator<CommentViewDto[]>> {
    const post = await this.postsRepository.findPost(postId);

    if (!post) {
      return null;
    }

    const comments = await pFind(
      this.CommentModel,
      query.pageNumber,
      query.pageSize,
      pFilterComments(postId),
      pSort(query.sortBy, query.sortDirection),
    );

    const totalCount = await this.CommentModel.countDocuments(
      pFilterComments(postId),
    );

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: await this.commentsMapping(comments, userId),
    });
  }

  async findComment(
    commentId: string,
    userId?: string,
  ): Promise<CommentViewDto | null> {
    if (!mongoose.isValidObjectId(commentId)) {
      return null;
    }

    const comment = await this.CommentModel.findOne({ _id: commentId });

    if (!comment || comment.commentatorInfo.isBanned) {
      return null;
    }

    const status = likeStatusFinder(comment, userId);
    /*const likesCount = likesCounter(comment, usersNotBanned, LikeStatus.Like);
    const dislikesCount = likesCounter(
      comment,
      usersNotBanned,
      LikeStatus.Dislike,
    );*/

    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt.toISOString(),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: status,
      },
    };
  }

  private async commentsMapping(
    comments: CommentLeanType[],
    userId: string,
  ): Promise<CommentViewDto[]> {
    return Promise.all(
      comments.map(async (c) => {
        const likeStatus = likeStatusFinder(c, userId);
        // const likesCount = likesCounter(c, usersNotBanned, LikeStatus.Like);
        // const dislikesCount = likesCounter(
        //   c,
        //   usersNotBanned,
        //   LikeStatus.Dislike,
        // );

        return {
          id: c._id.toString(),
          content: c.content,
          commentatorInfo: {
            userId: c.commentatorInfo.userId,
            userLogin: c.commentatorInfo.userLogin,
          },
          createdAt: c.createdAt.toISOString(),
          likesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: likeStatus,
          },
        };
      }),
    );
  }
}
