import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', width: 15 })
  name: string;

  @Column({ type: 'varchar', width: 500 })
  description: string;

  @Column({ type: 'varchar' })
  websiteUrl: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ type: 'boolean' })
  isMembership: boolean;

  @Column({ type: 'boolean' })
  isBanned: boolean;

  // @Column({ required: true })
  // banInfo: BlogBanInfoSchema;
}
