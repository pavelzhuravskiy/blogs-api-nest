import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserBanByBlogger {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  userId: number; // FK 🔑

  @Column({ type: 'integer' })
  blogId: number; // FK 🔑

  @Column({ type: 'timestamp with time zone', nullable: true })
  banDate: Date | null;

  @Column({ type: 'varchar', nullable: true })
  banReason: string | null;
}
