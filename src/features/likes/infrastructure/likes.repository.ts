import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../../comments/comment.entity';
import { Post, PostDocument, PostModelType } from '../../posts/post.entity';
import { LikesDataType } from '../schemas/likes-data.type';

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
    data: LikesDataType,
  ): Promise<CommentDocument | PostDocument | null> {
    const user = await data.model.findOne({
      _id: data.commentOrPostId,
      'likesInfo.users.userId': data.userId,
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async pushUserInLikesInfo(
    data: LikesDataType,
    userLogin: string,
  ): Promise<boolean> {
    const result = await data.model.updateOne(
      { _id: data.commentOrPostId },
      {
        $push: {
          'likesInfo.users': {
            addedAt: new Date(),
            userId: data.userId,
            userLogin: userLogin,
            likeStatus: data.likeStatus,
          },
        },
      },
    );
    return result.matchedCount === 1;
  }

  async findUserLikeStatus(data: LikesDataType): Promise<string | null> {
    const user = await data.model.findOne(
      { _id: data.commentOrPostId },
      {
        'likesInfo.users': {
          $filter: {
            input: '$likesInfo.users',
            cond: { $eq: ['$$this.userId', data.userId] },
          },
        },
      },
    );

    if (!user || user.likesInfo.users.length === 0) {
      return null;
    }

    return user.likesInfo.users[0].likeStatus;
  }

  async updateLikesCount(data: LikesDataType): Promise<boolean> {
    const result = await data.model.updateOne(
      { _id: data.commentOrPostId },
      {
        $set: {
          'likesInfo.likesCount': data.likesCount,
          'likesInfo.dislikesCount': data.dislikesCount,
        },
      },
    );
    return result.matchedCount === 1;
  }

  async updateLikesStatus(data: LikesDataType): Promise<boolean> {
    const result = await data.model.updateOne(
      { _id: data.commentOrPostId, 'likesInfo.users.userId': data.userId },
      {
        $set: {
          'likesInfo.users.$.likeStatus': data.likeStatus,
        },
      },
    );
    return result.matchedCount === 1;
  }
}
