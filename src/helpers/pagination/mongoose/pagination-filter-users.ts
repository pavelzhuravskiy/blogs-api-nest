import { FilterQuery } from 'mongoose';
import { BlogDocument } from '../../../api/entities/_mongoose/blog.entity';
import { BanStatus } from '../../../enums/ban-status.enum';

export const pFilterUsersSA = (
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

    filter.$and.push({ $or: filter.$or });
  }

  return filter;
};
