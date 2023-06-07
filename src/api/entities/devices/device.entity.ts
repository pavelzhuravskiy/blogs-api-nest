import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Device {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  userId: string; // FK 🔑

  @Column({ type: 'uuid' })
  deviceId: string;

  @Column({ type: 'varchar' })
  ip: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'timestamp with time zone' })
  lastActiveDate: number;

  @Column({ type: 'timestamp with time zone' })
  expirationDate: number;
}
