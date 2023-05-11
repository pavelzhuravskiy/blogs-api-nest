import { FilterQuery } from 'mongoose';
import { BlogDocument } from '../../blogs/schemas/blog.entity';

export const pFilterPosts = (blogId: string) => {
  const filter: FilterQuery<BlogDocument> = {};

  if (blogId) {
    filter.blogId = blogId;
  }

  return filter;
};
