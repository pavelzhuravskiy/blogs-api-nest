import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './post.entity';

@Entity('post_images_main')
export class PostMainImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  url: string;

  @Column({ type: 'int' })
  width: number;

  @Column({ type: 'int' })
  height: number;

  @Column({ type: 'bigint' })
  size: number;

  @ManyToOne(() => Post, (post) => post.postMainImages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  post: Post;
}
