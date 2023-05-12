import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Paginator } from '../common/schemas/paginator';
import {
  Comment,
  CommentLeanType,
  CommentModelType,
} from './schemas/comment.entity';
import { CommentViewModel } from './schemas/comment.view';
import { CommonQueryDto } from '../common/dto/common-query.dto';
import { PostsQueryRepository } from '../posts/posts.query.repository';
import { LikeStatus } from '../likes/like-status.enum';
import { pFind } from '../helpers/pagination/pagination-find';
import { pSort } from '../helpers/pagination/pagination-sort';
import { pFilterComments } from '../helpers/pagination/pagination-filter-comments';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    private postsQueryRepository: PostsQueryRepository,
  ) {}
  async findComments(
    query: CommonQueryDto,
    postId: string,
  ): Promise<Paginator<CommentViewModel[]>> {
    const post = await this.postsQueryRepository.findPost(postId);

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
      items: await this.commentsMapping(comments),
    });
  }

  async findComment(id: string): Promise<CommentViewModel | null> {
    if (!mongoose.isValidObjectId(id)) {
      return null;
    }

    const comment = await this.CommentModel.findOne({ _id: id });

    if (!comment) {
      return null;
    }

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
        myStatus: LikeStatus.None,
      },
    };
  }

  private async commentsMapping(
    comments: CommentLeanType[],
  ): Promise<CommentViewModel[]> {
    return comments.map((c) => {
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
          myStatus: LikeStatus.None,
        },
      };
    });
  }
}
