import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Blog } from '../blogs/blog.entity';

@Entity('user_bans_by_blogger')
export class UserBanByBlogger {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'is_banned', type: 'bool' })
  isBanned: boolean;

  @Column({
    name: 'ban_date',
    type: 'timestamp with time zone',
    nullable: true,
  })
  banDate: Date | null;

  @Column({ name: 'ban_reason', type: 'varchar', nullable: true })
  banReason: string | null;

  @OneToOne(() => User, (user) => user.userBanByBlogger, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Blog, (blog) => blog.userBanByBlogger, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  blog: Blog;
}
