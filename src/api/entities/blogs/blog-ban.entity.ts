import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blog } from './blog.entity';

@Entity('blog_bans')
export class BlogBan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'is_banned', type: 'bool' })
  isBanned: boolean;

  @Column({
    name: 'ban_date',
    type: 'timestamp with time zone',
    nullable: true,
  })
  banDate: Date;

  @OneToOne(() => Blog, (blog) => blog.blogBan, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  blog: Blog;
}
