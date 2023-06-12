import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', width: 300 })
  content: string;

  @Column({ type: 'integer' })
  commentatorId: number; // FK 🔑;

  @Column({ type: 'integer' })
  postId: number; // FK 🔑;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
