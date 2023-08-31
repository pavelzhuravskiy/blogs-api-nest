import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogViewDto } from '../../../dto/blogs/view/blog.view.dto';
import { Paginator } from '../../../../helpers/paginator';
import { BlogQueryDto } from '../../../dto/blogs/query/blog.query.dto';
import { SuperAdminBlogViewDto } from '../../../dto/blogs/view/superadmin/sa.blog.view.dto';
import { Blog } from '../../../entities/blogs/blog.entity';
import * as process from 'process';
import { BlogImagesViewDto } from '../../../dto/blogs/view/blog-images.view.dto';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,
  ) {}

  async findBlog(blogId: string): Promise<BlogViewDto> {
    try {
      const blogs = await this.blogsRepository
        .createQueryBuilder('b')
        .leftJoinAndSelect('b.blogBan', 'bb')
        .leftJoinAndSelect('b.blogWallpaperImage', 'bwi')
        .leftJoinAndSelect('b.blogMainImages', 'bmi')
        .where(`b.id = :blogId`, {
          blogId: blogId,
        })
        .andWhere(`bb.isBanned = false`)
        .getMany();

      const mappedBlogs = await this.blogsMapping(blogs);
      return mappedBlogs[0];
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async findBlogsForPublicUser(
    query: BlogQueryDto,
  ): Promise<Paginator<BlogViewDto[]>> {
    const blogs = await this.blogsRepository
      .createQueryBuilder('b')
      .where(`${query.searchNameTerm ? 'b.name ilike :nameTerm' : ''}`, {
        nameTerm: `%${query.searchNameTerm}%`,
      })
      .andWhere(`bb.isBanned = false`)
      .leftJoinAndSelect('b.blogBan', 'bb')
      .leftJoinAndSelect('b.blogWallpaperImage', 'bwi')
      .leftJoinAndSelect('b.blogMainImages', 'bmi')
      .orderBy(`b.${query.sortBy}`, query.sortDirection)
      .skip((query.pageNumber - 1) * query.pageSize)
      .take(query.pageSize)
      .getMany();

    const totalCount = await this.blogsRepository
      .createQueryBuilder('b')
      .where(`${query.searchNameTerm ? 'b.name ilike :nameTerm' : ''}`, {
        nameTerm: `%${query.searchNameTerm}%`,
      })
      .andWhere(`bb.isBanned = false`)
      .leftJoinAndSelect('b.blogBan', 'bb')
      .leftJoinAndSelect('b.blogWallpaperImage', 'bwi')
      .leftJoinAndSelect('b.blogMainImages', 'bmi')
      .getCount();

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: await this.blogsMapping(blogs),
    });
  }

  async findBlogsOfCurrentBlogger(
    query: BlogQueryDto,
    userId: string,
  ): Promise<Paginator<BlogViewDto[]>> {
    const blogs = await this.blogsRepository
      .createQueryBuilder('b')
      .where(`${query.searchNameTerm ? 'b.name ilike :nameTerm' : ''}`, {
        nameTerm: `%${query.searchNameTerm}%`,
      })
      .andWhere(`u.id = :userId`, {
        userId: userId,
      })
      .leftJoinAndSelect('b.user', 'u')
      .leftJoinAndSelect('b.blogWallpaperImage', 'bwi')
      .leftJoinAndSelect('b.blogMainImages', 'bmi')
      .orderBy(`b.${query.sortBy}`, query.sortDirection)
      .skip((query.pageNumber - 1) * query.pageSize)
      .take(query.pageSize)
      .getMany();

    const totalCount = await this.blogsRepository
      .createQueryBuilder('b')
      .where(`${query.searchNameTerm ? 'b.name ilike :nameTerm' : ''}`, {
        nameTerm: `%${query.searchNameTerm}%`,
      })
      .andWhere(`u.id = :userId`, {
        userId: userId,
      })
      .leftJoinAndSelect('b.user', 'u')
      .leftJoinAndSelect('b.blogWallpaperImage', 'bwi')
      .leftJoinAndSelect('b.blogMainImages', 'bmi')
      .getCount();

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: await this.blogsMapping(blogs),
    });
  }

  async findBlogsForSA(
    query: BlogQueryDto,
  ): Promise<Paginator<SuperAdminBlogViewDto[]>> {
    const blogs = await this.blogsRepository
      .createQueryBuilder('b')
      .where(`${query.searchNameTerm ? 'b.name ilike :nameTerm' : ''}`, {
        nameTerm: `%${query.searchNameTerm}%`,
      })
      .leftJoinAndSelect('b.blogBan', 'bb')
      .leftJoinAndSelect('b.user', 'u')
      .orderBy(`b.${query.sortBy}`, query.sortDirection)
      .skip((query.pageNumber - 1) * query.pageSize)
      .take(query.pageSize)
      .getMany();

    const totalCount = await this.blogsRepository
      .createQueryBuilder('b')
      .where(`${query.searchNameTerm ? 'b.name ilike :nameTerm' : ''}`, {
        nameTerm: `%${query.searchNameTerm}%`,
      })
      .leftJoinAndSelect('b.blogBan', 'bb')
      .leftJoinAndSelect('b.user', 'u')
      .getCount();

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: await this.blogsMappingForSA(blogs),
    });
  }

  async findBlogImages(blogId: string): Promise<BlogImagesViewDto> {
    try {
      const blogs = await this.blogsRepository
        .createQueryBuilder('b')
        .leftJoinAndSelect('b.blogWallpaperImage', 'bwi')
        .leftJoinAndSelect('b.blogMainImages', 'bmi')
        .where(`b.id = :blogId`, {
          blogId: blogId,
        })
        .getMany();

      const mappedBlogs = await this.blogImagesMapping(blogs);
      return mappedBlogs[0];
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  private async blogImagesMapping(blogs: Blog[]): Promise<BlogImagesViewDto[]> {
    return blogs.map((b) => {
      let wallpaperImage = null;

      if (b.blogWallpaperImage) {
        wallpaperImage = {
          url: process.env.S3_DOMAIN + b.blogWallpaperImage.url,
          width: Number(b.blogWallpaperImage.width),
          height: Number(b.blogWallpaperImage.height),
          fileSize: Number(b.blogWallpaperImage.size),
        };
      }

      return {
        wallpaper: wallpaperImage,
        main: b.blogMainImages.map((bmi) => {
          return {
            url: process.env.S3_DOMAIN + bmi.url,
            width: Number(bmi.width),
            height: Number(bmi.height),
            fileSize: Number(bmi.size),
          };
        }),
      };
    });
  }

  private async blogsMapping(blogs: Blog[]): Promise<BlogViewDto[]> {
    return blogs.map((b) => {
      let wallpaperImage = null;

      if (b.blogWallpaperImage) {
        wallpaperImage = {
          url: process.env.S3_DOMAIN + b.blogWallpaperImage.url,
          width: Number(b.blogWallpaperImage.width),
          height: Number(b.blogWallpaperImage.height),
          fileSize: Number(b.blogWallpaperImage.size),
        };
      }

      return {
        id: b.id.toString(),
        name: b.name,
        description: b.description,
        websiteUrl: b.websiteUrl,
        createdAt: b.createdAt,
        isMembership: b.isMembership,
        images: {
          wallpaper: wallpaperImage,
          main: b.blogMainImages.map((bmi) => {
            return {
              url: process.env.S3_DOMAIN + bmi.url,
              width: Number(bmi.width),
              height: Number(bmi.height),
              fileSize: Number(bmi.size),
            };
          }),
        },
      };
    });
  }

  private async blogsMappingForSA(
    blogs: Blog[],
  ): Promise<SuperAdminBlogViewDto[]> {
    return blogs.map((b) => {
      return {
        id: b.id.toString(),
        name: b.name,
        description: b.description,
        websiteUrl: b.websiteUrl,
        createdAt: b.createdAt,
        isMembership: b.isMembership,
        blogOwnerInfo: {
          userId: b.user.id.toString(),
          userLogin: b.user.login,
        },
        banInfo: {
          isBanned: b.blogBan.isBanned,
          banDate: b.blogBan.banDate,
        },
      };
    });
  }
}
