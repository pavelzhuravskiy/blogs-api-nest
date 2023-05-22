import { LikeStatus } from '../../../../enums/like-status.enum';
import { CommentLeanType } from '../../comments/comment.entity';
import { PostLeanType } from '../../posts/post.entity';

export const likesCounter = (
  commentOrPost: CommentLeanType | PostLeanType,
  likeStatus: LikeStatus,
) => {
  const users = commentOrPost.likesInfo.users;
  const likesCount = users.filter(
    (u) => u.likeStatus === likeStatus && !u.isBanned,
  );
  return likesCount.length;
};
