import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'device_id', type: 'uuid' })
  deviceId: string;

  @Column({ type: 'varchar' })
  ip: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ name: 'last_active_date', type: 'bigint' })
  lastActiveDate: number;

  @Column({ name: 'expiration_date', type: 'bigint' })
  expirationDate: number;

  @ManyToOne(() => User, (user) => user.device, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
