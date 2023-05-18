import { LikeStatus } from '../../../enums/like-status.enum';
import { CommentLeanType } from '../../comments/comment.entity';
import { PostLeanType } from '../../posts/post.entity';

export const likesCounter = (
  commentOrPost: CommentLeanType | PostLeanType,
  usersNotBanned: string[],
  likeStatus: LikeStatus,
) => {
  const users = commentOrPost.likesInfo.users;
  const likesCount = users.filter(
    (u) => usersNotBanned.includes(u.userId) && u.likeStatus === likeStatus,
  );
  return likesCount.length;
};
