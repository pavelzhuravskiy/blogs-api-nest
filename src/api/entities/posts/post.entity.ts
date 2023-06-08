import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', width: 30 })
  title: string;

  @Column({ type: 'varchar', width: 100 })
  shortDescription: string;

  @Column({ type: 'varchar', width: 1000 })
  content: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ type: 'integer' })
  blogId: number; // FK 🔑
}
