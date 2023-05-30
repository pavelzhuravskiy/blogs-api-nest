import { LikeStatus } from '../../../../enums/like-status.enum';
import { CommentLeanType } from '../../../entities/comment.entity';
import { PostLeanType } from '../../../entities/post.entity';

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
