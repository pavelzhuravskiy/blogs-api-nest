import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class UserBanBySA {
  @PrimaryColumn({ type: 'integer' })
  userId: number;

  @Column({ type: 'bool' })
  isBanned: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  banDate: Date | null;

  @Column({ type: 'varchar', nullable: true })
  banReason: string | null;
}
