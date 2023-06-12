import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { PostInputDto } from '../../dto/posts/input/post.input.dto';
import { LikesInfoSchema } from '../../dto/likes/schemas/likes-info.schema';
import { BlogDocument } from './blog.entity';
import { BlogInfoSchema } from '../../dto/posts/schemas/blog-info.schema';

export type PostDocument = HydratedDocument<PostMongooseEntity>;
export type PostLeanType = PostMongooseEntity & { _id: Types.ObjectId };

export type PostModelStaticType = {
  createPost: (
    PostModel: PostModelType,
    postInputDto: PostInputDto,
    blog: BlogDocument,
  ) => PostDocument;
};

export type PostModelType = Model<PostMongooseEntity> & PostModelStaticType;

@Schema()
export class PostMongooseEntity {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  blogInfo: BlogInfoSchema;

  @Prop({ required: true })
  likesInfo: LikesInfoSchema;

  updatePost(updatePostDto) {
    this.title = updatePostDto.title;
    this.shortDescription = updatePostDto.shortDescription;
    this.content = updatePostDto.content;
  }

  static createPost(
    PostModel: PostModelType,
    postInputDto: PostInputDto,
    blog: BlogDocument,
  ): PostDocument {
    const post = {
      title: postInputDto.title,
      shortDescription: postInputDto.shortDescription,
      content: postInputDto.content,
      blogInfo: {
        blogId: blog._id.toString(),
        blogName: blog.name,
        blogIsBanned: false,
        blogOwnerId: blog.blogOwnerInfo.userId,
        blogOwnerLogin: blog.blogOwnerInfo.userLogin,
        blogOwnerIsBanned: blog.blogOwnerInfo.isBanned,
      },
      createdAt: new Date(),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        users: [],
      },
    };
    return new PostModel(post);
  }
}

export const PostSchema = SchemaFactory.createForClass(PostMongooseEntity);

PostSchema.methods = {
  updatePost: PostMongooseEntity.prototype.updatePost,
};

const postStaticMethods: PostModelStaticType = {
  createPost: PostMongooseEntity.createPost,
};

PostSchema.statics = postStaticMethods;
