import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserBan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  userId: number; // FK 🔑

  @Column({ type: 'timestamp with time zone', nullable: true })
  banDate: Date;

  @Column({ type: 'varchar', nullable: true })
  banReason: string | null;
}
