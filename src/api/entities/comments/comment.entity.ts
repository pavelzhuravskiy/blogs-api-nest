import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Post } from '../posts/post.entity';
import { CommentLike } from './comment-like.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', width: 300 })
  content: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.comment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Post, (post) => post.comment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  post: Post;

  @OneToMany(() => CommentLike, (commentLike) => commentLike.comment)
  commentLike: CommentLike;

  static checkSortingField(value: any) {
    const c = new Comment();
    c.id = 1;
    c.content = '';
    c.createdAt = new Date();
    return c.hasOwnProperty(value);
  }
}
