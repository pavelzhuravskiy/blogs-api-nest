import { FilterQuery } from 'mongoose';
import { BlogDocument } from '../../blogs/blog.entity';

export const pFilterComments = (postId: string) => {
  const filter: FilterQuery<BlogDocument> = {};

  if (postId) {
    filter.postId = postId;
  }

  return filter;
};
