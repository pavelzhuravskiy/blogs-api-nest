import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BlogViewDto } from '../../../dto/blogs/view/blog.view.dto';
import { Paginator } from '../../../../helpers/paginator';
import { BlogQueryDto } from '../../../dto/blogs/query/blog.query.dto';
import { SuperAdminBlogViewDto } from '../../../dto/blogs/view/superadmin/sa.blog.view.dto';
import { Blog } from '../../../entities/blogs/blog.entity';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async findBlog(blogId: number | string): Promise<BlogViewDto> {
    try {
      const blogs = await this.blogsRepository
        .createQueryBuilder('b')
        .where(`b.id = :blogId`, {
          blogId: blogId,
        })
        .andWhere(`bb.isBanned = false`)
        .leftJoinAndSelect('b.blogBan', 'bb')
        .getMany();

      const mappedBlogs = await this.blogsMapping(blogs);
      return mappedBlogs[0];
    } catch (e) {
      console.log(e);
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
    userId: number,
  ): Promise<Paginator<BlogViewDto[]>> {
    const blogs = await this.blogsRepository
      .createQueryBuilder('b')
      .where(`${query.searchNameTerm ? 'b.name ilike :nameTerm' : ''}`, {
        nameTerm: `%${query.searchNameTerm}%`,
      })
      .andWhere(`bo.userId = :userId`, {
        userId: userId,
      })
      .leftJoinAndSelect('b.blogOwner', 'bo')
      .orderBy(`b.${query.sortBy}`, query.sortDirection)
      .skip((query.pageNumber - 1) * query.pageSize)
      .take(query.pageSize)
      .getMany();

    const totalCount = await this.blogsRepository
      .createQueryBuilder('b')
      .where(`${query.searchNameTerm ? 'b.name ilike :nameTerm' : ''}`, {
        nameTerm: `%${query.searchNameTerm}%`,
      })
      .andWhere(`bo.userId = :userId`, {
        userId: userId,
      })
      .leftJoinAndSelect('b.blogOwner', 'bo')
      .getCount();

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: await this.blogsMapping(blogs),
    });
  }

  async findBlogsForSA(query: BlogQueryDto): Promise<Paginator<BlogViewDto[]>> {
    const blogs = await this.blogsRepository
      .createQueryBuilder('b')
      .where(`${query.searchNameTerm ? 'b.name ilike :nameTerm' : ''}`, {
        nameTerm: `%${query.searchNameTerm}%`,
      })
      .leftJoinAndSelect('b.blogOwner', 'bo')
      .leftJoinAndSelect('b.blogBan', 'bb')
      .leftJoinAndSelect('bo.user', 'u')
      .orderBy(`b.${query.sortBy}`, query.sortDirection)
      .skip((query.pageNumber - 1) * query.pageSize)
      .take(query.pageSize)
      .getMany();

    const totalCount = await this.blogsRepository
      .createQueryBuilder('b')
      .where(`${query.searchNameTerm ? 'b.name ilike :nameTerm' : ''}`, {
        nameTerm: `%${query.searchNameTerm}%`,
      })
      .leftJoinAndSelect('b.blogOwner', 'bo')
      .leftJoinAndSelect('b.blogBan', 'bb')
      .leftJoinAndSelect('bo.user', 'u')
      .getCount();

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: await this.blogsMappingForSA(blogs),
    });
  }

  private async blogsMapping(blogs: Blog[]): Promise<BlogViewDto[]> {
    return blogs.map((b) => {
      return {
        id: b.id.toString(),
        name: b.name,
        description: b.description,
        websiteUrl: b.websiteUrl,
        createdAt: b.createdAt,
        isMembership: b.isMembership,
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
          userId: b.blogOwner.user.id.toString(),
          userLogin: b.blogOwner.user.login,
        },
        banInfo: {
          isBanned: b.blogBan.isBanned,
          banDate: b.blogBan.banDate,
        },
      };
    });
  }
}
