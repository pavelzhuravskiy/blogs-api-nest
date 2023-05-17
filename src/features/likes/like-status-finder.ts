import { LikeStatus } from './enum/like-status.enum';
import { CommentLeanType } from '../comments/comment.entity';
import { PostLeanType } from '../posts/post.entity';

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
