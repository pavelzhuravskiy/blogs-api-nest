import { FilterQuery } from 'mongoose';
import { BlogDocument } from '../../features/blogs/blog.entity';

export const pFilterPosts = (blogId?: string) => {
  const filter: FilterQuery<BlogDocument> = {
    $and: [{ 'blogInfo.blogOwnerIsBanned': false }],
  };

  if (blogId) {
    filter.$and.push({
      'blogInfo.blogId': blogId,
    });
  }

  return filter;
};
