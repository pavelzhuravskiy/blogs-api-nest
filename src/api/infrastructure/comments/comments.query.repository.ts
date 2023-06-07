import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentLeanType,
  CommentModelType,
} from '../../entities/_mongoose/comment.entity';
import { CommentViewDto } from '../../dto/comments/view/comment.view.dto';
import { likeStatusFinder } from '../../_public/likes/helpers/like-status-finder';
import { PostsRepository } from '../posts/posts.repository';
import { likesCounter } from '../../_public/likes/helpers/likes-counter';
import { LikeStatus } from '../../../enums/like-status.enum';
import { BloggerCommentViewDto } from '../../dto/comments/view/blogger/blogger.comment.view.dto';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    private postsRepository: PostsRepository,
  ) {}
  // async findComments(
  //   query: QueryDto,
  //   postId: string,
  //   userId: string,
  // ): Promise<Paginator<CommentViewDto[]>> {
  //   const post = await this.postsRepository.findPost(postId);
  //
  //   if (!post) {
  //     return null;
  //   }
  //
  //   const comments = await pFind(
  //     this.CommentModel,
  //     query.pageNumber,
  //     query.pageSize,
  //     pFilterComments(postId),
  //     pSort(query.sortBy, query.sortDirection),
  //   );
  //
  //   const totalCount = await this.CommentModel.countDocuments(
  //     pFilterComments(postId),
  //   );
  //
  //   return Paginator.paginate({
  //     pageNumber: query.pageNumber,
  //     pageSize: query.pageSize,
  //     totalCount: totalCount,
  //     items: await this.commentsMapping(comments, userId),
  //   });
  // }

  // async findCommentsOfBloggersPosts(
  //   query: QueryDto,
  //   userId: string,
  // ): Promise<Paginator<BloggerCommentViewDto[]>> {
  //   const comments = await pFind(
  //     this.CommentModel,
  //     query.pageNumber,
  //     query.pageSize,
  //     pFilterCommentsForBlogger(userId),
  //     pSort(query.sortBy, query.sortDirection),
  //   );
  //
  //   const totalCount = await this.CommentModel.countDocuments(
  //     pFilterCommentsForBlogger(userId),
  //   );
  //
  //   return Paginator.paginate({
  //     pageNumber: query.pageNumber,
  //     pageSize: query.pageSize,
  //     totalCount: totalCount,
  //     items: await this.commentsForBloggerMapping(comments, userId),
  //   });
  // }

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
    const likesCount = likesCounter(comment, LikeStatus.Like);
    const dislikesCount = likesCounter(comment, LikeStatus.Dislike);

    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt.toISOString(),
      likesInfo: {
        likesCount: likesCount,
        dislikesCount: dislikesCount,
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
        const likesCount = likesCounter(c, LikeStatus.Like);
        const dislikesCount = likesCounter(c, LikeStatus.Dislike);

        return {
          id: c._id.toString(),
          content: c.content,
          commentatorInfo: {
            userId: c.commentatorInfo.userId,
            userLogin: c.commentatorInfo.userLogin,
          },
          createdAt: c.createdAt.toISOString(),
          likesInfo: {
            likesCount: likesCount,
            dislikesCount: dislikesCount,
            myStatus: likeStatus,
          },
        };
      }),
    );
  }

  private async commentsForBloggerMapping(
    comments: CommentLeanType[],
    userId: string,
  ): Promise<BloggerCommentViewDto[]> {
    return Promise.all(
      comments.map(async (c) => {
        const likeStatus = likeStatusFinder(c, userId);
        const likesCount = likesCounter(c, LikeStatus.Like);
        const dislikesCount = likesCounter(c, LikeStatus.Dislike);

        return {
          id: c._id.toString(),
          content: c.content,
          createdAt: c.createdAt,
          commentatorInfo: {
            userId: c.commentatorInfo.userId,
            userLogin: c.commentatorInfo.userLogin,
          },
          likesInfo: {
            likesCount: likesCount,
            dislikesCount: dislikesCount,
            myStatus: likeStatus,
          },
          postInfo: {
            blogId: c.postInfo.blogId,
            blogName: c.postInfo.blogName,
            id: c.postInfo.id,
            title: c.postInfo.title,
          },
        };
      }),
    );
  }
}
