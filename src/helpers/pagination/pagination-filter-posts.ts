import { FilterQuery } from 'mongoose';
import { BlogDocument } from '../../api/entities/_mongoose/blog.entity';

export const pFilterPosts = (blogId?: string) => {
  const filter: FilterQuery<BlogDocument> = {
    $and: [
      { 'blogInfo.blogOwnerIsBanned': false },
      { 'blogInfo.blogIsBanned': false },
    ],
  };

  if (blogId) {
    filter.$and.push({
      'blogInfo.blogId': blogId,
    });
  }

  return filter;
};
