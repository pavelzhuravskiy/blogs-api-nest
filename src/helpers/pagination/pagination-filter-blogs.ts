import { FilterQuery } from 'mongoose';
import { BlogDocument } from '../../blogs/schemas/blog.entity';

export const pFilterBlogs = (name: string) => {
  const filter: FilterQuery<BlogDocument> = {};

  if (name) {
    filter.name = { $regex: name, $options: 'i' };
  }

  return filter;
};
