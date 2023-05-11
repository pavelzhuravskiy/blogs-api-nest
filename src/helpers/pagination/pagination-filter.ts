import { FilterQuery } from 'mongoose';
import { BlogDocument } from '../../blogs/schemas/blog.entity';

export const pFilter = (
  name?: string,
  blogId?: string,
  postId?: string,
  login?: string,
  email?: string,
) => {
  const filter: FilterQuery<BlogDocument> = {};

  if (name) {
    filter.name = { $regex: name, $options: 'i' };
  }

  if (blogId) {
    filter.blogId = blogId;
  }

  if (postId) {
    filter.postId = postId;
  }

  if (login || email) {
    filter.$or = [];

    if (login) {
      filter.$or.push({
        'accountData.login': { $regex: login, $options: 'i' },
      });
    }

    if (email) {
      filter.$or.push({
        'accountData.email': { $regex: email, $options: 'i' },
      });
    }
  }

  return filter;
};
