import { FilterQuery } from 'mongoose';
import { BlogDocument } from '../../api/entities/blog.entity';

export const pFilterComments = (postId: string) => {
  const filter: FilterQuery<BlogDocument> = {
    $and: [{ 'commentatorInfo.isBanned': false }, { postId: postId }],
  };

  return filter;
};
