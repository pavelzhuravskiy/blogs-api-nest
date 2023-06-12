import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { BlogInputDto } from '../../dto/blogs/input/blog.input.dto';
import { UserDocument } from './user.entity';
import { BlogOwnerSchema } from '../../dto/blogs/schemas/blog-owner.schema';
import { BlogBanInfoSchema } from '../../dto/blogs/schemas/blog-ban-info.schema';

export type BlogDocument = HydratedDocument<BlogMongooseEntity>;
export type BlogLeanType = BlogMongooseEntity & { _id: Types.ObjectId };

export type BlogModelStaticType = {
  createBlog: (
    BlogModel: BlogModelType,
    blogInputDto: BlogInputDto,
    user: UserDocument,
  ) => BlogDocument;
};

export type BlogModelType = Model<BlogMongooseEntity> & BlogModelStaticType;

@Schema()
export class BlogMongooseEntity {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  websiteUrl: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  isMembership: boolean;

  @Prop({ required: true })
  blogOwnerInfo: BlogOwnerSchema;

  @Prop({ required: true })
  banInfo: BlogBanInfoSchema;

  updateBlog(updateBlogDto) {
    this.name = updateBlogDto.name;
    this.description = updateBlogDto.description;
    this.websiteUrl = updateBlogDto.websiteUrl;
  }

  bindUser(user: UserDocument) {
    this.blogOwnerInfo.userId = user.id;
    this.blogOwnerInfo.userLogin = user.accountData.login;
  }

  banBlog() {
    this.banInfo.isBanned = true;
    this.banInfo.banDate = new Date();
  }

  unbanBlog() {
    this.banInfo.isBanned = false;
    this.banInfo.banDate = null;
  }

  static createBlog(
    BlogModel: BlogModelType,
    blogInputDto: BlogInputDto,
    user: UserDocument,
  ): BlogDocument {
    const blog = {
      name: blogInputDto.name,
      description: blogInputDto.description,
      websiteUrl: blogInputDto.websiteUrl,
      createdAt: new Date(),
      isMembership: false,
      blogOwnerInfo: {
        userId: user.id,
        userLogin: user.accountData.login,
        isBanned: false,
      },
      banInfo: {
        isBanned: false,
        banDate: null,
      },
    };
    return new BlogModel(blog);
  }
}

export const BlogSchema = SchemaFactory.createForClass(BlogMongooseEntity);

BlogSchema.methods = {
  updateBlog: BlogMongooseEntity.prototype.updateBlog,
  bindUser: BlogMongooseEntity.prototype.bindUser,
  banBlog: BlogMongooseEntity.prototype.banBlog,
  unbanBlog: BlogMongooseEntity.prototype.unbanBlog,
};

const blogStaticMethods: BlogModelStaticType = {
  createBlog: BlogMongooseEntity.createBlog,
};

BlogSchema.statics = blogStaticMethods;
