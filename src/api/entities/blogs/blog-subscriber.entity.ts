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

  @Column({ name: 'subscription_status', type: 'varchar' })
  subscriptionStatus: string;

  @Column('uuid', { name: 'telegram_code', nullable: true })
  telegramCode: string;

  @Column('int', { name: 'telegram_id', nullable: true })
  telegramId: number;

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
