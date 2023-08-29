import { Player } from '../api/entities/quiz/player.entity';
import { Answer } from '../api/entities/quiz/answer.entity';
import { Game } from '../api/entities/quiz/game.entity';
import { UserBanBySA } from '../api/entities/users/user-ban-by-sa.entity';
import { UserBanByBlogger } from '../api/entities/users/user-ban-by-blogger.entity';
import { User } from '../api/entities/users/user.entity';
import { UserEmailConfirmation } from '../api/entities/users/user-email-confirmation.entity';
import { Blog } from '../api/entities/blogs/blog.entity';
import { BlogBan } from '../api/entities/blogs/blog-ban.entity';
import { Comment } from '../api/entities/comments/comment.entity';
import { CommentLike } from '../api/entities/comments/comment-like.entity';
import { Post } from '../api/entities/posts/post.entity';
import { PostLike } from '../api/entities/posts/post-like.entity';
import { Device } from '../api/entities/devices/device.entity';
import { UserPasswordRecovery } from '../api/entities/users/user-password-recovery.entity';
import { Question } from '../api/entities/quiz/question.entity';
import { BlogMainImage } from '../api/entities/blogs/blog-image-main.entity';
import { BlogWallpaperImage } from '../api/entities/blogs/blog-image-wallpaper.entity';

export type TypeORMEntity =
  | Player
  | Answer
  | Game
  | Question
  | User
  | UserBanBySA
  | UserBanByBlogger
  | UserEmailConfirmation
  | UserPasswordRecovery
  | Blog
  | BlogBan
  | BlogWallpaperImage
  | BlogMainImage
  | Comment
  | CommentLike
  | Post
  | PostLike
  | Device;
