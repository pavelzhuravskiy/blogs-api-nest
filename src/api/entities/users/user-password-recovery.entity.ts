import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_password_recoveries')
export class UserPasswordRecovery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'recovery_code', type: 'uuid' })
  recoveryCode: string;

  @Column({ name: 'expiration_date', type: 'timestamp with time zone' })
  expirationDate: Date;

  @OneToOne(() => User, (user) => user.userPasswordRecovery, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
