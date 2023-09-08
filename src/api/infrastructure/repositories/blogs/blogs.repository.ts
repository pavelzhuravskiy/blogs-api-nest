import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from '../../../entities/blogs/blog.entity';
import { BlogWallpaperImage } from '../../../entities/blogs/blog-image-wallpaper.entity';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,
    @InjectRepository(BlogWallpaperImage)
    private readonly blogWallpaperImagesRepository: Repository<BlogWallpaperImage>,
  ) {}
  // ***** Find blog operations *****
  async findBlogById(blogId: string): Promise<Blog | null> {
    try {
      return await this.blogsRepository
        .createQueryBuilder('b')
        .where(`b.id = :blogId`, { blogId: blogId })
        .getOne();
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async findBlogWithOwner(blogId: string): Promise<Blog | null> {
    try {
      return await this.blogsRepository
        .createQueryBuilder('b')
        .leftJoinAndSelect('b.user', 'u')
        .where(`b.id = :blogId`, { blogId: blogId })
        .getOne();
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async findBlogForBlogBan(blogId: string): Promise<Blog | null> {
    try {
      return await this.blogsRepository
        .createQueryBuilder('b')
        .leftJoinAndSelect('b.blogBan', 'bb')
        .where(`b.id = :blogId`, { blogId: blogId })
        .getOne();
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async findBlogWallpaperImageRecord(
    blogId: string,
  ): Promise<BlogWallpaperImage | null> {
    try {
      return await this.blogWallpaperImagesRepository
        .createQueryBuilder('bwi')
        .where(`bwi.blogId = :blogId`, { blogId: blogId })
        .getOne();
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  // ***** Delete operations *****
  async deleteBlog(blogId: string): Promise<boolean> {
    const result = await this.blogsRepository
      .createQueryBuilder('b')
      .delete()
      .from(Blog)
      .where('id = :blogId', { blogId: blogId })
      .execute();
    return result.affected === 1;
  }
}
