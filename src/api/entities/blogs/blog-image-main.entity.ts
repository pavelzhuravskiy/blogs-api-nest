import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blog } from './blog.entity';

@Entity('blog_images_main')
export class BlogMainImage {
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

  @ManyToOne(() => Blog, (blog) => blog.blogMainImages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  blog: Blog;
}
