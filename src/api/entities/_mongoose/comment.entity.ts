import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { CommentatorInfoSchema } from '../../dto/comments/schemas/commentator-info.schema';
import { LikesInfoSchema } from '../../dto/likes/schemas/likes-info.schema';
import { CommentInputDto } from '../../dto/comments/input/comment.input.dto';
import { PostDocument } from './post.entity';
import { UserDocument } from './user.entity';
import { PostInfoSchema } from '../../dto/comments/schemas/post-info.schema';

export type CommentDocument = HydratedDocument<CommentMongooseEntity>;
export type CommentLeanType = CommentMongooseEntity & { _id: Types.ObjectId };

export type CommentModelStaticType = {
  createComment: (
    CommentModel: CommentModelType,
    commentInputDto: CommentInputDto,
    post: PostDocument,
    user: UserDocument,
  ) => CommentDocument;
};

export type CommentModelType = Model<CommentMongooseEntity> &
  CommentModelStaticType;

@Schema()
export class CommentMongooseEntity {
  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  commentatorInfo: CommentatorInfoSchema;

  @Prop({ required: true })
  postInfo: PostInfoSchema;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  likesInfo: LikesInfoSchema;

  updateComment(updateCommentDto) {
    this.content = updateCommentDto.content;
  }

  static createComment(
    CommentModel: CommentModelType,
    commentInputDto: CommentInputDto,
    post: PostDocument,
    user: UserDocument,
  ): CommentDocument {
    const comment = {
      content: commentInputDto.content,
      commentatorInfo: {
        userId: user.id,
        userLogin: user.accountData.login,
        isBanned: user.banInfo.isBanned,
      },
      postInfo: {
        id: post._id.toString(),
        title: post.title,
        blogId: post.blogInfo.blogId,
        blogName: post.blogInfo.blogName,
        blogOwnerId: post.blogInfo.blogOwnerId,
      },
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

export const CommentSchema = SchemaFactory.createForClass(
  CommentMongooseEntity,
);

CommentSchema.methods = {
  updateComment: CommentMongooseEntity.prototype.updateComment,
};

const commentStaticMethods: CommentModelStaticType = {
  createComment: CommentMongooseEntity.createComment,
};

CommentSchema.statics = commentStaticMethods;
