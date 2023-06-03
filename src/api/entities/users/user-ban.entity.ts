import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserBan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'boolean', nullable: true })
  isBanned: boolean;

  @Column({ type: 'timestamp', nullable: true })
  banDate: Date;

  @Column({ type: 'varchar', nullable: true })
  banReason: string | null;

  @Column({ type: 'integer' })
  userId: number; // FK 🔑
}
