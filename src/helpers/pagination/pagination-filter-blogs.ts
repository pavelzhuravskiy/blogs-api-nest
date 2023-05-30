import { FilterQuery } from 'mongoose';
import { BlogDocument } from '../../api/entities/blog.entity';
import { Role } from '../../enums/role.enum';

export const pFilterBlogs = (name: string, userId: string, role: string) => {
  const filter: FilterQuery<BlogDocument> = {};

  if (name || userId || role === Role.User) {
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

    if (role === Role.User) {
      filter.$and.push({
        'banInfo.isBanned': false,
      });
    }
  }

  return filter;
};
