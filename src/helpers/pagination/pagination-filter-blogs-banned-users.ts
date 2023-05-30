import { FilterQuery } from 'mongoose';
import { BlogDocument } from '../../api/entities/blog.entity';

export const pFilterBannedUsers = (loginTerm: string) => {
  const filter: FilterQuery<BlogDocument> = {};

  if (loginTerm) {
    filter['bannedUsers.login'] = { $regex: loginTerm, $options: 'i' };
  }

  return filter;
};
