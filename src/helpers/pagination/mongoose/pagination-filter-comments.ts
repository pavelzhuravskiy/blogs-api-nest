import { FilterQuery } from 'mongoose';
import { BlogDocument } from '../../../api/entities/_mongoose/blog.entity';

export const pFilterComments = (postId: string) => {
  const filter: FilterQuery<BlogDocument> = {
    $and: [{ 'commentatorInfo.isBanned': false }, { 'postInfo.id': postId }],
  };

  return filter;
};
