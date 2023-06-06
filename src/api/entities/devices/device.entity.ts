import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Device {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  userId: string; // FK 🔑

  @Column({ type: 'varchar' })
  ip: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'timestamp' })
  lastActiveDate: number;

  @Column({ type: 'timestamp' })
  expirationDate: number;
}
