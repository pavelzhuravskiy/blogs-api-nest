import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateBlogDto } from '../dto/create-blog.dto';

export type BlogDocument = HydratedDocument<Blog>;

export type BlogModelStaticType = {
  createBlog: (
    createBlogDto: CreateBlogDto,
    BlogModel: BlogModelType,
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

  static createBlog(
    createBlogDto: CreateBlogDto,
    BlogModel: BlogModelType,
  ): BlogDocument {
    const blog = {
      name: createBlogDto.name,
      description: createBlogDto.description,
      websiteUrl: createBlogDto.websiteUrl,
      createdAt: new Date(),
      isMembership: false,
    };
    return new BlogModel(blog);
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

const blogStaticMethods: BlogModelStaticType = {
  createBlog: Blog.createBlog,
};

BlogSchema.statics = blogStaticMethods;
