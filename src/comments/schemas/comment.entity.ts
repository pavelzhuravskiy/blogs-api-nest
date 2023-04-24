import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CommentatorInfoSchema } from './commentator.info.schema';
import { LikesInfoSchema } from '../../common/schemas/likes.info.schema';
import { CommentCreateDto } from '../dto/comment.create.dto';
import { PostDocument } from '../../posts/schemas/post.entity';

export type CommentDocument = HydratedDocument<Comment>;

export type CommentModelStaticType = {
  createComment: (
    createCommentDto: CommentCreateDto,
    CommentModel: CommentModelType,
    post: PostDocument,
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
  extendedLikesInfo: LikesInfoSchema;

  // updateComment(updateCommentDto) {
  //   this.name = updateCommentDto.name;
  //   this.description = updateCommentDto.description;
  //   this.websiteUrl = updateCommentDto.websiteUrl;
  // }

  static createComment(
    createCommentDto: CommentCreateDto,
    CommentModel: CommentModelType,
    post: PostDocument,
  ): CommentDocument {
    const comment = {
      content: createCommentDto.content,
      commentatorInfo: {
        userId: 'testUserId',
        userLogin: 'testUserLogin',
      },
      postId: post._id.toString(),
      createdAt: new Date(),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        users: [],
      },
    };
    return new CommentModel(comment);
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

// BlogSchema.methods = {
//   updateBlog: Blog.prototype.updateBlog,
// };
//
const commentStaticMethods: CommentModelStaticType = {
  createComment: Comment.createComment,
};

CommentSchema.statics = commentStaticMethods;
