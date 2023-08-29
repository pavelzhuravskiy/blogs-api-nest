import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blog } from './blog.entity';

@Entity('blog_images_main')
export class BlogMainImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', width: 500 })
  url: string;

  @Column({ type: 'int' })
  width: number;

  @Column({ type: 'int' })
  height: number;

  @Column({ type: 'bigint' })
  size: number;

  @OneToOne(() => Blog, (blog) => blog.blogMainImage, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  blog: Blog;
}
