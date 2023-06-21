import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_email_confirmations')
export class UserEmailConfirmation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'confirmation_code', type: 'uuid' })
  confirmationCode: string;

  @Column({ name: 'expiration_date', type: 'timestamp with time zone' })
  expirationDate: Date;

  @OneToOne(() => User, (user) => user.userEmailConfirmation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
