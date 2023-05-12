import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../comments/schemas/comment.entity';
import { CommentsRepository } from '../comments/comments.repository';
import { PostsRepository } from '../posts/posts.repository';
import { Post, PostModelType } from '../posts/schemas/post.entity';
import { LikesRepository } from './likes.repository';
import { LikeStatus } from './like-status.enum';
import { LikesDataType } from './schemas/likes-data.type';
import { UsersRepository } from '../users/users.repository';

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
    private readonly usersRepository: UsersRepository,
  ) {}

  async updateCommentLikes(
    commentId: string,
    userId: string,
    likeStatus: string,
  ): Promise<boolean | null> {
    const comment = await this.commentsRepository.findComment(commentId);

    if (!comment) {
      return null;
    }

    const data: LikesDataType = {
      commentOrPostId: commentId,
      userId: userId,
      likeStatus: likeStatus,
      likesCount: comment.likesInfo.likesCount,
      dislikesCount: comment.likesInfo.dislikesCount,
      model: this.CommentModel,
    };

    return this.updateLikesData(data);
  }

  async updatePostLikes(
    postId: string,
    userId: string,
    likeStatus: string,
  ): Promise<boolean | null> {
    const post = await this.postsRepository.findPost(postId);

    if (!post) {
      return null;
    }

    const data: LikesDataType = {
      commentOrPostId: postId,
      userId: userId,
      likeStatus: likeStatus,
      likesCount: post.likesInfo.likesCount,
      dislikesCount: post.likesInfo.dislikesCount,
      model: this.PostModel,
    };

    return this.updateLikesData(data);
  }

  async updateLikesData(data: LikesDataType): Promise<boolean | null> {
    const userInLikesInfo = await this.likesRepository.findUserInLikesInfo(
      data,
    );

    if (!userInLikesInfo) {
      const user = await this.usersRepository.findUserById(data.userId);
      const userLogin = user.accountData.login;

      await this.likesRepository.pushUserInLikesInfo(data, userLogin);

      if (data.likeStatus === LikeStatus.Like) {
        data.likesCount++;
      }

      if (data.likeStatus === LikeStatus.Dislike) {
        data.dislikesCount++;
      }

      return this.likesRepository.updateLikesCount(data);
    }

    const userLikeStatus = await this.likesRepository.findUserLikeStatus(data);

    switch (userLikeStatus) {
      case LikeStatus.None:
        if (data.likeStatus === LikeStatus.Like) {
          data.likesCount++;
        }

        if (data.likeStatus === LikeStatus.Dislike) {
          data.dislikesCount++;
        }
        break;

      case LikeStatus.Like:
        if (data.likeStatus === LikeStatus.None) {
          data.likesCount--;
        }

        if (data.likeStatus === LikeStatus.Dislike) {
          data.likesCount--;
          data.dislikesCount++;
        }
        break;

      case LikeStatus.Dislike:
        if (data.likeStatus === LikeStatus.None) {
          data.dislikesCount--;
        }

        if (data.likeStatus === LikeStatus.Like) {
          data.dislikesCount--;
          data.likesCount++;
        }
    }

    await this.likesRepository.updateLikesCount(data);
    return this.likesRepository.updateLikesStatus(data);
  }
}

// TODO Optimistic concurrency // INC?
