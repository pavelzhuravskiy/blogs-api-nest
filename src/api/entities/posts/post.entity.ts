import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blog } from '../blogs/blog.entity';
import { Comment } from '../comments/comment.entity';
import { PostLike } from './post-like.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', width: 30 })
  title: string;

  @Column({ name: 'short_description', type: 'varchar', width: 100 })
  shortDescription: string;

  @Column({ type: 'varchar', width: 1000 })
  content: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @ManyToOne(() => Blog, (blog) => blog.post, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  blog: Blog;

  @OneToMany(() => Comment, (comment) => comment.post)
  comment: Comment[];

  @OneToMany(() => PostLike, (postLike) => postLike.post)
  postLike: PostLike[];

  static checkSortingField(value: any) {
    const p = new Post();
    p.id = 1;
    p.title = '';
    p.shortDescription = '';
    p.content = '';
    p.createdAt = new Date();
    return p.hasOwnProperty(value);
  }
}
