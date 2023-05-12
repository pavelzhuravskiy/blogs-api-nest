import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../comments/schemas/comment.entity';
import {
  Post,
  PostDocument,
  PostModelType,
} from '../posts/schemas/post.entity';

@Injectable()
export class LikesRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    @InjectModel(Post.name)
    private PostModel: PostModelType,
  ) {}
  async save(commentOrPost: CommentDocument | PostDocument) {
    return commentOrPost.save();
  }

  async findUserInLikesInfo(
    model: any,
    commentOrPostId: string,
    userId: string,
  ): Promise<CommentDocument | PostDocument | null> {
    const user = await model.findOne({
      _id: commentOrPostId,
      'likesInfo.users.userId': userId,
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async pushUserInLikesInfo(
    model: any,
    commentOrPostId: string,
    userId: string,
    likeStatus: string,
  ): Promise<boolean> {
    const result = await model.updateOne(
      { _id: commentOrPostId },
      {
        $push: {
          'likesInfo.users': {
            userId,
            likeStatus,
          },
        },
      },
    );
    return result.matchedCount === 1;
  }

  async findUserLikeStatus(
    model: any,
    commentOrPostId: string,
    userId: string,
  ): Promise<string | null> {
    const user = await model.findOne(
      { _id: commentOrPostId },
      {
        'likesInfo.users': {
          $filter: {
            input: '$likesInfo.users',
            cond: { $eq: ['$$this.userId', userId.toString()] },
          },
        },
      },
    );

    if (!user || user.likesInfo.users.length === 0) {
      return null;
    }

    return user.likesInfo.users[0].likeStatus;
  }

  async updateLikesCount(
    model: any,
    commentId: string,
    likesCount: number,
    dislikesCount: number,
  ): Promise<boolean> {
    const result = await model.updateOne(
      { _id: commentId },
      {
        $set: {
          'likesInfo.likesCount': likesCount,
          'likesInfo.dislikesCount': dislikesCount,
        },
      },
    );
    return result.matchedCount === 1;
  }

  async updateLikesStatus(
    model: any,
    commentOrPostId: string,
    userId: string,
    likeStatus: string,
  ): Promise<boolean> {
    const result = await model.updateOne(
      { _id: commentOrPostId, 'likesInfo.users.userId': userId },
      {
        $set: {
          'likesInfo.users.$.likeStatus': likeStatus,
        },
      },
    );
    return result.matchedCount === 1;
  }
}
