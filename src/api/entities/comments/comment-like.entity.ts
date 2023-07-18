import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comment } from './comment.entity';
import { User } from '../users/user.entity';

@Entity('comment_likes')
export class CommentLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'like_status', type: 'varchar' })
  likeStatus: string;

  @ManyToOne(() => Comment, (comment) => comment.commentLike, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  comment: Comment;

  @ManyToOne(() => User, (user) => user.commentLike, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
