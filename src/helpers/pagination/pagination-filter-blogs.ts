import { FilterQuery } from 'mongoose';
import { BlogDocument } from '../../features/blogs/blog.entity';

export const pFilterBlogs = (name: string, userId: string) => {
  const filter: FilterQuery<BlogDocument> = {};

  if (name || userId) {
    filter.$and = [];

    if (name) {
      filter.$and.push({
        name: { $regex: name, $options: 'i' },
      });
    }

    if (userId) {
      filter.$and.push({
        'blogOwnerInfo.userId': userId,
      });
    }
  }

  return filter;
};
