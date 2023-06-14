import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CommentLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  commentId: number; // FK 🔑;

  @Column({ type: 'integer' })
  userId: number; // FK 🔑;

  @Column({ type: 'varchar' })
  likeStatus: string;
}
