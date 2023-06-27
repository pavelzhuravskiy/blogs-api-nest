import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserBanBySA } from './user-ban-by-sa.entity';
import { UserEmailConfirmation } from './user-email-confirmation.entity';
import { UserPasswordRecovery } from './user-password-recovery.entity';
import { Device } from '../devices/device.entity';
import { Comment } from '../comments/comment.entity';
import { UserBanByBlogger } from './user-ban-by-blogger.entity';
import { Blog } from '../blogs/blog.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', width: 10, unique: true })
  login: string;

  @Column({ name: 'password_hash', type: 'varchar' })
  passwordHash: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ name: 'is_confirmed', type: 'bool' })
  isConfirmed: boolean;

  @OneToOne(() => UserBanBySA, (userBanBySA) => userBanBySA.user)
  userBanBySA: UserBanBySA;

  @OneToOne(() => UserBanByBlogger, (userBanByBlogger) => userBanByBlogger.user)
  userBanByBlogger: UserBanByBlogger;

  @OneToOne(
    () => UserEmailConfirmation,
    (userEmailConfirmation) => userEmailConfirmation.user,
  )
  userEmailConfirmation: UserEmailConfirmation;

  @OneToOne(
    () => UserPasswordRecovery,
    (userPasswordRecovery) => userPasswordRecovery.user,
  )
  userPasswordRecovery: UserPasswordRecovery;

  @OneToMany(() => Device, (device) => device.user)
  device: Device;

  @OneToMany(() => Blog, (blog) => blog.user)
  blog: Blog;

  @OneToMany(() => Comment, (comment) => comment.user)
  comment: Comment;

  static checkSortingField(value: any) {
    const u = new User();
    u.id = 1;
    u.login = '';
    u.email = '';
    u.createdAt = new Date();
    return u.hasOwnProperty(value);
  }
}
