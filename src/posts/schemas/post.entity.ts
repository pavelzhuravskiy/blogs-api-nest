import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { PostCreateDto } from '../dto/post.create.dto';
import { LikesInfoSchema } from '../../common/schemas/likes.info.schema';
import { BlogDocument } from '../../blogs/schemas/blog.entity';

export type PostDocument = HydratedDocument<Post>;

export type PostModelStaticType = {
  createPost: (
    createPostDto: PostCreateDto,
    PostModel: PostModelType,
    blog: BlogDocument,
  ) => PostDocument;
};

export type PostModelType = Model<Post> & PostModelStaticType;

@Schema()
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  blogId: string;

  @Prop({ required: true })
  blogName: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  extendedLikesInfo: LikesInfoSchema;

  updatePost(updatePostDto) {
    this.title = updatePostDto.title;
    this.shortDescription = updatePostDto.shortDescription;
    this.content = updatePostDto.content;
    this.blogId = updatePostDto.blogId;
  }

  static createPost(
    createPostDto: PostCreateDto,
    PostModel: PostModelType,
    blog: BlogDocument,
  ): PostDocument {
    const post = {
      title: createPostDto.title,
      shortDescription: createPostDto.shortDescription,
      content: createPostDto.content,
      blogId: blog._id.toString(),
      blogName: blog.name,
      createdAt: new Date(),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        users: [],
      },
    };
    return new PostModel(post);
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.methods = {
  updatePost: Post.prototype.updatePost,
};

const postStaticMethods: PostModelStaticType = {
  createPost: Post.createPost,
};

PostSchema.statics = postStaticMethods;
