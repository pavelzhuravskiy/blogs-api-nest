import { Injectable } from '@nestjs/common';
import mongoose, { FilterQuery, SortOrder } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Paginator } from '../common/schemas/paginator';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from './schemas/comment.entity';
import { CommentViewModel } from './schemas/comment.view';
import { CommonQueryDto } from '../common/dto/common-query.dto';
import { PostsQueryRepository } from '../posts/posts.query.repository';
import { LikeStatus } from '../likes/like-status.enum';

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
    const filter: FilterQuery<CommentDocument> = {};

    const post = await this.postsQueryRepository.findPost(postId);

    if (!post) {
      return null;
    }

    filter.postId = postId;

    const sortingObj: { [key: string]: SortOrder } = {
      [query.sortBy]: query.sortDirection,
    };

    if (query.sortDirection === 'asc') {
      sortingObj[query.sortBy] = 'asc';
    }

    const comments = await this.CommentModel.find(filter)
      .sort(sortingObj)
      .skip(query.pageNumber > 0 ? (query.pageNumber - 1) * query.pageSize : 0)
      .limit(query.pageSize > 0 ? query.pageSize : 0)
      .lean();

    const totalCount = await this.CommentModel.countDocuments(filter);
    const pagesCount = Math.ceil(totalCount / query.pageSize);

    return {
      pagesCount: pagesCount,
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
      items: comments.map((comment) => {
        return {
          id: comment._id.toString(),
          content: comment.content,
          commentatorInfo: {
            userId: comment.commentatorInfo.userId,
            userLogin: comment.commentatorInfo.userLogin,
          },
          createdAt: comment.createdAt.toISOString(),
          likesInfo: {
            likesCount: comment.extendedLikesInfo.likesCount,
            dislikesCount: comment.extendedLikesInfo.dislikesCount,
            myStatus: 'None',
          },
        };
      }),
    };
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
        likesCount: comment.extendedLikesInfo.likesCount,
        dislikesCount: comment.extendedLikesInfo.dislikesCount,
        myStatus: LikeStatus.None,
      },
    };
  }
}
