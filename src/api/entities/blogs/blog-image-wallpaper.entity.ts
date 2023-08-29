import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blog } from './blog.entity';

@Entity('blog_images_wallpapers')
export class BlogWallpaperImage {
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

  @OneToOne(() => Blog, (blog) => blog.blogWallpaperImage, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  blog: Blog;
}
