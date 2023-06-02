import { FilterQuery } from 'mongoose';
import { UserDocument } from '../../api/entities/_mongoose/user.entity';

export const pFilterUsersBannedByBlogger = (
  loginTerm: string,
  blogId: string,
) => {
  const filter: FilterQuery<UserDocument> = {
    $and: [{ 'bansForBlogs.banInfo.blogId': blogId }],
  };

  if (loginTerm) {
    filter.$and.push({
      'bansForBlogs.login': { $regex: loginTerm, $options: 'i' },
    });
  }

  return filter;
};
