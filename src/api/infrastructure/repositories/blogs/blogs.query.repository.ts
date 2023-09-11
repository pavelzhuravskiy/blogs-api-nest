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
import { BlogSubscriber } from '../../../entities/blogs/blog-subscriber.entity';
import { BlogMainImage } from '../../../entities/blogs/blog-image-main.entity';
import { SubscriptionStatus } from '../../../../enums/subscription-status.enum';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,
  ) {}

  async findBlog(blogId: string, userId: string): Promise<BlogViewDto> {
    try {
      const blogs = await this.blogsRepository
        .createQueryBuilder('b')
        .addSelect(
          (qb) =>
            qb
              .select('bs.subscriptionStatus')
              .from(BlogSubscriber, 'bs')
              .where('bs.blogId = b.id')
              .andWhere('bs.userId = :userId', { userId: userId }),
          'subscription_status',
        )
        .addSelect(
          (qb) =>
            qb
              .select(
                `jsonb_agg(json_build_object('url', agg.url, 'width', agg.width, 'height', agg.height, 'size', agg.size)
                 )`,
              )
              .from((qb) => {
                return qb
                  .select(`url, width, height, size`)
                  .from(BlogMainImage, 'bmi')
                  .where('bmi.blogId = b.id');
              }, 'agg'),

          'main_images',
        )
        .leftJoinAndSelect('b.blogBan', 'bb')
        .leftJoinAndSelect('b.blogWallpaperImage', 'bwi')
        .where(`b.id = :blogId`, {
          blogId: blogId,
        })
        .andWhere(`bb.isBanned = false`)
        .getRawMany();

      const mappedBlogs = await this.blogsMapping(blogs);
      return mappedBlogs[0];
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async findBlogsForPublicUser(
    query: BlogQueryDto,
    userId: string,
  ): Promise<Paginator<BlogViewDto[]>> {
    const blogs = await this.blogsRepository
      .createQueryBuilder('b')
      .addSelect(
        (qb) =>
          qb
            .select('bs.subscriptionStatus')
            .from(BlogSubscriber, 'bs')
            .where('bs.blogId = b.id')
            .andWhere('bs.userId = :userId', { userId: userId }),
        'subscription_status',
      )
      .addSelect(
        (qb) =>
          qb
            .select(
              `jsonb_agg(json_build_object('url', agg.url, 'width', agg.width, 'height', agg.height, 'size', agg.size)
                 )`,
            )
            .from((qb) => {
              return qb
                .select(`url, width, height, size`)
                .from(BlogMainImage, 'bmi')
                .where('bmi.blogId = b.id');
            }, 'agg'),

        'main_images',
      )
      .where(`${query.searchNameTerm ? 'b.name ilike :nameTerm' : ''}`, {
        nameTerm: `%${query.searchNameTerm}%`,
      })
      .andWhere(`bb.isBanned = false`)
      .leftJoinAndSelect('b.blogBan', 'bb')
      .leftJoinAndSelect('b.blogWallpaperImage', 'bwi')
      .orderBy(`b.${query.sortBy}`, query.sortDirection)
      .limit(query.pageSize)
      .offset((query.pageNumber - 1) * query.pageSize)
      .getRawMany();

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
      .addSelect(
        (qb) =>
          qb
            .select('bs.subscriptionStatus')
            .from(BlogSubscriber, 'bs')
            .where('bs.blogId = b.id')
            .andWhere('bs.userId = :userId', { userId: userId }),
        'subscription_status',
      )
      .addSelect(
        (qb) =>
          qb
            .select(
              `jsonb_agg(json_build_object('url', agg.url, 'width', agg.width, 'height', agg.height, 'size', agg.size)
                 )`,
            )
            .from((qb) => {
              return qb
                .select(`url, width, height, size`)
                .from(BlogMainImage, 'bmi')
                .where('bmi.blogId = b.id');
            }, 'agg'),

        'main_images',
      )
      .where(`${query.searchNameTerm ? 'b.name ilike :nameTerm' : ''}`, {
        nameTerm: `%${query.searchNameTerm}%`,
      })
      .andWhere(`u.id = :userId`, {
        userId: userId,
      })
      .leftJoinAndSelect('b.user', 'u')
      .leftJoinAndSelect('b.blogWallpaperImage', 'bwi')
      .orderBy(`b.${query.sortBy}`, query.sortDirection)
      .skip((query.pageNumber - 1) * query.pageSize)
      .take(query.pageSize)
      .getRawMany();

    // console.log(blogs);

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

  private async blogsMapping(blogs: any[]): Promise<BlogViewDto[]> {
    return blogs.map((b) => {
      let wallpaperImage = null;
      let mainImages = [];
      let subscriptionStatus = SubscriptionStatus.None;

      if (b.bwi_id) {
        wallpaperImage = {
          url: process.env.S3_DOMAIN + b.bwi_url,
          width: Number(b.bwi_width),
          height: Number(b.bwi_height),
          fileSize: Number(b.bwi_size),
        };
      }

      if (b.main_images) {
        mainImages = b.main_images.map((bmi) => {
          return {
            url: process.env.S3_DOMAIN + bmi.url,
            width: Number(bmi.width),
            height: Number(bmi.height),
            fileSize: Number(bmi.size),
          };
        });
      }

      if (b.subscription_status) {
        subscriptionStatus = b.subscription_status;
      }

      return {
        id: b.b_id,
        name: b.b_name,
        description: b.b_description,
        websiteUrl: b.b_website_url,
        createdAt: b.b_created_at,
        isMembership: b.b_is_membership,
        images: {
          wallpaper: wallpaperImage,
          main: mainImages,
        },
        currentUserSubscriptionStatus: subscriptionStatus,
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
