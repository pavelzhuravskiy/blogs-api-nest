import { LikeStatus } from '../../../enums/like-status.enum';
import { CommentLeanType } from '../../comments/comment.entity';
import { PostLeanType } from '../../posts/post.entity';

export const dislikesCounter = (
  commentOrPost: CommentLeanType | PostLeanType,
  usersNotBanned: string[],
) => {
  const users = commentOrPost.likesInfo.users;
  const likesCount = users.filter(
    (u) =>
      usersNotBanned.includes(u.userId) && u.likeStatus === LikeStatus.Like,
  );
  return likesCount.length;
};
