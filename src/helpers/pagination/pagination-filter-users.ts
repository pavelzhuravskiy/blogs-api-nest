import { FilterQuery } from 'mongoose';
import { BlogDocument } from '../../features/blogs/blog.entity';
import { BanStatus } from '../../enums/ban-status.enum';

export const pFilterUsers = (
  banStatus: string,
  login: string,
  email: string,
) => {
  const filter: FilterQuery<BlogDocument> = {};

  if ((banStatus && banStatus !== BanStatus.All) || login || email) {
    filter.$and = [];
  }

  if (banStatus === BanStatus.Banned) {
    filter.$and.push({
      'banInfo.isBanned': true,
    });
  }

  if (banStatus === BanStatus.NotBanned) {
    filter.$and.push({
      'banInfo.isBanned': false,
    });
  }

  if (login) {
    filter.$and.push({
      'accountData.login': { $regex: login, $options: 'i' },
    });
  }

  if (email) {
    filter.$and.push({
      'accountData.email': { $regex: email, $options: 'i' },
    });
  }

  return filter;
};
