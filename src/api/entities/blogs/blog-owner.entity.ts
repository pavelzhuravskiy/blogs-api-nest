import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Blog } from './blog.entity';

@Entity('blog_owners')
export class BlogOwner {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Blog, (blog) => blog.blogOwner, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  blog: Blog;

  @ManyToOne(() => User, (user) => user.blogOwner, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
