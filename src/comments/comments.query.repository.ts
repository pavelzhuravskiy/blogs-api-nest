import { Injectable, NotFoundException } from '@nestjs/common';
import mongoose, { FilterQuery, SortOrder } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Paginator } from '../common/schemas/paginator';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from './schemas/comment.entity';
import { CommentQuery } from './dto/comment.query';
import { CommentViewModel } from './schemas/comment.view';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
  ) {}
  async findComments(
    query: CommentQuery,
    postId: string,
  ): Promise<Paginator<CommentViewModel[]>> {
    const filter: FilterQuery<CommentDocument> = { postId };

    const sortingObj: { [key: string]: SortOrder } = {
      [query.sortBy || 'createdAt']: 'desc',
    };

    if (query.sortDirection === 'asc') {
      sortingObj[query.sortBy || 'createdAt'] = 'asc';
    }

    const comments = await this.CommentModel.find(filter)
      .sort(sortingObj)
      .skip(
        +query.pageNumber > 0 ? (+query.pageNumber - 1) * +query.pageSize : 0,
      )
      .limit(+query.pageSize > 0 ? +query.pageSize : 0)
      .lean();

    const totalCount = await this.CommentModel.countDocuments(filter);
    const pagesCount = Math.ceil(totalCount / +query.pageSize);

    return {
      pagesCount: pagesCount || 1,
      page: +query.pageNumber || 1,
      pageSize: +query.pageSize || 10,
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

  async findComment(id: string): Promise<CommentViewModel> {
    if (!mongoose.isValidObjectId(id)) {
      throw new NotFoundException();
    }

    const comment = await this.CommentModel.findOne({ _id: id });

    if (!comment) {
      throw new NotFoundException();
    }

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
  }
}
