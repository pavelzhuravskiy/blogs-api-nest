import { FilterQuery } from 'mongoose';
import { BlogDocument } from '../../features/blogs/blog.entity';

export const pFilterPosts = (blogsNotBanned: string[], blogId?: string) => {
  const filter: FilterQuery<BlogDocument> = {
    $and: [{ blogId: { $in: blogsNotBanned } }],
  };

  if (blogId) {
    filter.blogId = blogId;
  }

  return filter;
};
