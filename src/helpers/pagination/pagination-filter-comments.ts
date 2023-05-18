import { FilterQuery } from 'mongoose';
import { BlogDocument } from '../../features/blogs/blog.entity';

export const pFilterComments = (usersNotBanned: string[], postId: string) => {
  const filter: FilterQuery<BlogDocument> = {
    $and: [
      { 'commentatorInfo.userId': { $in: usersNotBanned } },
      { postId: postId },
    ],
  };

  return filter;
};
