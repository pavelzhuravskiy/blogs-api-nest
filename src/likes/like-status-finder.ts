import { LikeStatus } from './like-status.enum';
import { CommentLeanType } from '../comments/schemas/comment.entity';
import { PostLeanType } from '../posts/schemas/post.entity';

export const likeStatusFinder = (
  commentOrPost: CommentLeanType | PostLeanType,
  userId: string,
) => {
  const users = commentOrPost.likesInfo.users;
  const user = users.find((u) => u.userId === userId);

  if (user) {
    return user.likeStatus;
  } else {
    return LikeStatus.None;
  }
};
