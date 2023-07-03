import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BlogBan } from './blog-ban.entity';
import { Post } from '../posts/post.entity';
import { UserBanByBlogger } from '../users/user-ban-by-blogger.entity';
import { User } from '../users/user.entity';

@Entity('blogs')
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', width: 15 })
  name: string;

  @Column({ type: 'varchar', width: 500 })
  description: string;

  @Column({ name: 'website_url', type: 'varchar' })
  websiteUrl: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ name: 'is_membership', type: 'boolean', default: false })
  isMembership: boolean;

  @OneToOne(() => BlogBan, (blogBan) => blogBan.blog)
  blogBan: BlogBan;

  @ManyToOne(() => User, (user) => user.blog)
  @JoinColumn()
  user: User;

  @OneToMany(() => Post, (post) => post.blog)
  post: Post[];

  @OneToMany(
    () => UserBanByBlogger,
    (userBanByBlogger) => userBanByBlogger.blog,
  )
  userBanByBlogger: UserBanByBlogger[];

  static checkSortingField(value: any) {
    const b = new Blog();
    b.id = 1;
    b.name = '';
    b.description = '';
    b.websiteUrl = '';
    b.createdAt = new Date();
    b.isMembership = false;
    return b.hasOwnProperty(value);
  }
}
