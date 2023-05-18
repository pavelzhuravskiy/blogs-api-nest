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
import { likeStatusFinder } from '../../likes/like-status-finder';
import { PostsRepository } from '../../posts/infrastructure/posts.repository';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    private postsRepository: PostsRepository,
  ) {}
  async findComments(
    usersNotBanned: string[],
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
      pFilterComments(usersNotBanned, postId),
      pSort(query.sortBy, query.sortDirection),
    );

    const totalCount = await this.CommentModel.countDocuments(
      pFilterComments(usersNotBanned, postId),
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
    usersNotBanned?: string[],
  ): Promise<CommentViewDto | null> {
    if (!mongoose.isValidObjectId(commentId)) {
      return null;
    }

    const comment = await this.CommentModel.findOne({
      $and: [
        { 'commentatorInfo.userId': { $in: usersNotBanned } },
        { _id: commentId },
      ],
    });

    if (!comment) {
      return null;
    }

    const status = likeStatusFinder(comment, userId);

    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt.toISOString(),
      likesInfo: {
        likesCount: comment.likesInfo.likesCount,
        dislikesCount: comment.likesInfo.dislikesCount,
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
        const status = likeStatusFinder(c, userId);
        return {
          id: c._id.toString(),
          content: c.content,
          commentatorInfo: {
            userId: c.commentatorInfo.userId,
            userLogin: c.commentatorInfo.userLogin,
          },
          createdAt: c.createdAt.toISOString(),
          likesInfo: {
            likesCount: c.likesInfo.likesCount,
            dislikesCount: c.likesInfo.dislikesCount,
            myStatus: status,
          },
        };
      }),
    );
  }
}
