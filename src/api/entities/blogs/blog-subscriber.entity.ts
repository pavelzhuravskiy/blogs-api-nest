import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Blog } from './blog.entity';

@Entity('blog_subscribers')
export class BlogSubscriber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'telegram_code', nullable: true })
  telegramCode: string;

  @Column('uuid', { name: 'telegram_id', nullable: true })
  telegramId: string;

  @ManyToOne(() => Blog, (blog) => blog.blogSubscriber, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn()
  blog: Blog;

  @ManyToOne(() => User, (user) => user.blogSubscriber, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
