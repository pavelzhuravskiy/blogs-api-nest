import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserBanBySA } from './user-ban-by-sa.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', width: 10, unique: true })
  login: string;

  @Column({ type: 'varchar' })
  passwordHash: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ type: 'bool' })
  isConfirmed: boolean;

  @OneToOne(() => UserBanBySA, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  userBanBySA: UserBanBySA;

  static checkSortingField(value: any) {
    const u = new User();
    u.id = 1;
    u.login = '';
    u.email = '';
    u.createdAt = new Date();
    return u.hasOwnProperty(value);
  }
}
