import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PostLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp with time zone' })
  addedAt: Date;

  @Column({ type: 'integer' })
  postId: number; // FK 🔑;

  @Column({ type: 'integer' })
  userId: number; // FK 🔑;

  @Column({ type: 'varchar' })
  likeStatus: string;
}
