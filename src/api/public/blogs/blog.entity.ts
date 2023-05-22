import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { BlogInputDto } from '../../blogger/dto/blog.input.dto';
import { UserDocument } from '../../superadmin/users/user.entity';
import { BlogOwnerSchema } from './dto/schemas/blog-owner.schema';

export type BlogDocument = HydratedDocument<Blog>;
export type BlogLeanType = Blog & { _id: Types.ObjectId };

export type BlogModelStaticType = {
  createBlog: (
    BlogModel: BlogModelType,
    blogInputDto: BlogInputDto,
    user: UserDocument,
  ) => BlogDocument;
};

export type BlogModelType = Model<Blog> & BlogModelStaticType;

@Schema()
export class Blog {
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

  updateBlog(updateBlogDto) {
    this.name = updateBlogDto.name;
    this.description = updateBlogDto.description;
    this.websiteUrl = updateBlogDto.websiteUrl;
  }

  bindUser(user: UserDocument) {
    this.blogOwnerInfo.userId = user.id;
    this.blogOwnerInfo.userLogin = user.accountData.login;
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
    };
    return new BlogModel(blog);
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.methods = {
  updateBlog: Blog.prototype.updateBlog,
  bindUser: Blog.prototype.bindUser,
};

const blogStaticMethods: BlogModelStaticType = {
  createBlog: Blog.createBlog,
};

BlogSchema.statics = blogStaticMethods;
