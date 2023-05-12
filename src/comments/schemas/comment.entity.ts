import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { CommentatorInfoSchema } from './commentator-info.schema';
import { LikesInfoSchema } from '../../likes/schemas/likes-info.schema';
import { CommentInputDto } from '../dto/comment-input.dto';
import { PostDocument } from '../../posts/schemas/post.entity';
import { UserDocument } from '../../users/schemas/user.entity';

export type CommentDocument = HydratedDocument<Comment>;
export type CommentLeanType = Comment & { _id: Types.ObjectId };

export type CommentModelStaticType = {
  createComment: (
    commentInputDto: CommentInputDto,
    CommentModel: CommentModelType,
    post: PostDocument,
    user: UserDocument,
  ) => CommentDocument;
};

export type CommentModelType = Model<Comment> & CommentModelStaticType;

@Schema()
export class Comment {
  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  commentatorInfo: CommentatorInfoSchema;

  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  likesInfo: LikesInfoSchema;

  updateComment(updateCommentDto) {
    this.content = updateCommentDto.content;
  }

  static createComment(
    commentInputDto: CommentInputDto,
    CommentModel: CommentModelType,
    post: PostDocument,
    user: UserDocument,
  ): CommentDocument {
    const comment = {
      content: commentInputDto.content,
      commentatorInfo: {
        userId: user.id,
        userLogin: user.accountData.login,
      },
      postId: post._id.toString(),
      createdAt: new Date(),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        users: [],
      },
    };
    return new CommentModel(comment);
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.methods = {
  updateComment: Comment.prototype.updateComment,
};

const commentStaticMethods: CommentModelStaticType = {
  createComment: Comment.createComment,
};

CommentSchema.statics = commentStaticMethods;
