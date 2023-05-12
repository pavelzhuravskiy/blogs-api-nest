import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../comments/schemas/comment.entity';
import { CommentsRepository } from '../comments/comments.repository';
import { PostsRepository } from '../posts/posts.repository';
import { ResultCode } from '../exceptions/exception-codes.enum';
import {
  commentIDField,
  commentNotFound,
  postIDField,
  postNotFound,
} from '../exceptions/exception.constants';
import { ExceptionResultType } from '../exceptions/types/exception-result.type';
import { Post, PostModelType } from '../posts/schemas/post.entity';
import { LikesRepository } from './likes.repository';
import { LikeStatus } from './like-status.enum';

@Injectable()
export class LikesService {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private readonly commentsRepository: CommentsRepository,
    private readonly postsRepository: PostsRepository,
    private readonly likesRepository: LikesRepository,
  ) {}

  async updateLikeStatus(
    likeStatus: string,
    userId: string,
    commentId?: string,
    postId?: string,
  ): Promise<ExceptionResultType<boolean>> {
    let commentOrPostId;
    let model;
    let likesCount;
    let dislikesCount;

    if (commentId) {
      const comment = await this.commentsRepository.findComment(commentId);

      if (!comment) {
        return {
          data: false,
          code: ResultCode.NotFound,
          field: commentIDField,
          message: commentNotFound,
        };
      }

      commentOrPostId = comment.id;
      model = this.CommentModel;
      likesCount = comment.likesInfo.likesCount;
      dislikesCount = comment.likesInfo.dislikesCount;
    }

    if (postId) {
      const post = await this.postsRepository.findPost(postId);

      if (!post) {
        return {
          data: false,
          code: ResultCode.NotFound,
          field: postIDField,
          message: postNotFound,
        };
      }

      commentOrPostId = post.id;
      model = this.PostModel;
      likesCount = post.likesInfo.likesCount;
      dislikesCount = post.likesInfo.dislikesCount;
    }

    const user = await this.likesRepository.findUserInLikesInfo(
      model,
      commentOrPostId,
      userId,
    );

    if (!user) {
      await this.likesRepository.pushUserInLikesInfo(
        model,
        commentOrPostId,
        userId,
        likeStatus,
      );

      if (likeStatus === LikeStatus.Like) {
        likesCount++;
      }

      if (likeStatus === LikeStatus.Dislike) {
        dislikesCount++;
      }

      await this.likesRepository.updateLikesCount(
        model,
        commentOrPostId,
        likesCount,
        dislikesCount,
      );

      return {
        data: true,
        code: ResultCode.Success,
      };
    }

    const userLikeDBStatus = await this.likesRepository.findUserLikeStatus(
      model,
      commentOrPostId,
      userId,
    );

    switch (userLikeDBStatus) {
      case LikeStatus.None:
        if (likeStatus === LikeStatus.Like) {
          likesCount++;
        }

        if (likeStatus === LikeStatus.Dislike) {
          dislikesCount++;
        }
        break;

      case LikeStatus.Like:
        if (likeStatus === LikeStatus.None) {
          likesCount--;
        }

        if (likeStatus === LikeStatus.Dislike) {
          likesCount--;
          dislikesCount++;
        }
        break;

      case LikeStatus.Dislike:
        if (likeStatus === LikeStatus.None) {
          dislikesCount--;
        }

        if (likeStatus === LikeStatus.Like) {
          dislikesCount--;
          likesCount++;
        }
    }

    await this.likesRepository.updateLikesCount(
      model,
      commentOrPostId,
      likesCount,
      dislikesCount,
    );

    await this.likesRepository.updateLikesStatus(
      model,
      commentOrPostId,
      userId,
      likeStatus,
    );

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}

// TODO Optimistic concurrency // INC?
