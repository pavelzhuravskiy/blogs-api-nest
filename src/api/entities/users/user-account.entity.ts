import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'boolean' })
  isMembership: boolean;

  @Column({ type: 'boolean' })
  isConfirmed: boolean;
}
