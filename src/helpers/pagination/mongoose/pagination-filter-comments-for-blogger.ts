import { FilterQuery } from 'mongoose';
import { BlogDocument } from '../../../api/entities/_mongoose/blog.entity';

export const pFilterCommentsForBlogger = (userId: string) => {
  const filter: FilterQuery<BlogDocument> = {
    $and: [
      { 'commentatorInfo.isBanned': false },
      { 'postInfo.blogOwnerId': userId },
    ],
  };

  return filter;
};
