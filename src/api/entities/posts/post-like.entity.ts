import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Post } from './post.entity';

@Entity('post_likes')
export class PostLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'like_status', type: 'varchar' })
  likeStatus: string;

  @Column({ name: 'added_at', type: 'timestamp with time zone' })
  addedAt: Date;

  @ManyToOne(() => Post, (post) => post.postLike, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  post: Post;

  @ManyToOne(() => User, (user) => user.commentLike, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
