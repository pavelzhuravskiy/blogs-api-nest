import { Injectable } from '@nestjs/common';
import { PostViewDto } from '../../../dto/posts/view/post.view.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { LikeStatus } from '../../../../enums/like-status.enum';
import { PostQueryDto } from '../../../dto/posts/query/post.query.dto';
import { Post } from '../../../entities/posts/post.entity';
import { Paginator } from '../../../../helpers/paginator';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async findPost(postId: string, userId: number): Promise<PostViewDto | null> {
    try {
      const posts = await this.postsRepository
        .createQueryBuilder('p')
        .where(`p.id = :postId`, {
          postId: postId,
        })
        .andWhere(`bb.isBanned = false`)
        .andWhere(`ubsa.isBanned = false`)
        .leftJoinAndSelect('p.blog', 'b')
        .leftJoinAndSelect('b.blogBan', 'bb')
        .leftJoinAndSelect('b.blogOwner', 'bo')
        .leftJoinAndSelect('bo.user', 'u')
        .leftJoinAndSelect('u.userBanBySA', 'ubsa')
        .getMany();

      const mappedPosts = await this.postsMapping(posts);
      return mappedPosts[0];
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findPosts(
    query: PostQueryDto,
    userId: number,
  ): Promise<Paginator<PostViewDto[]>> {
    const posts = await this.postsRepository
      .createQueryBuilder('p')
      .where(`bb.isBanned = false`)
      .andWhere(`ubsa.isBanned = false`)
      .leftJoinAndSelect('p.blog', 'b')
      .leftJoinAndSelect('b.blogBan', 'bb')
      .leftJoinAndSelect('b.blogOwner', 'bo')
      .leftJoinAndSelect('bo.user', 'u')
      .leftJoinAndSelect('u.userBanBySA', 'ubsa')
      .orderBy(`p.${query.sortBy}`, query.sortDirection)
      .skip((query.pageNumber - 1) * query.pageSize)
      .take(query.pageSize)
      .getMany();

    const totalCount = await this.postsRepository
      .createQueryBuilder('p')
      .where(`bb.isBanned = false`)
      .andWhere(`ubsa.isBanned = false`)
      .leftJoinAndSelect('p.blog', 'b')
      .leftJoinAndSelect('b.blogBan', 'bb')
      .leftJoinAndSelect('b.blogOwner', 'bo')
      .leftJoinAndSelect('bo.user', 'u')
      .leftJoinAndSelect('u.userBanBySA', 'ubsa')
      .getCount();

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: await this.postsMapping(posts),
    });
  }

  async findPostsForBlog(
    query: PostQueryDto,
    blogId: string,
    userId: number,
  ): Promise<Paginator<PostViewDto[]>> {
    try {
      const posts = await this.postsRepository
        .createQueryBuilder('p')
        .where(`b.id = :blogId`, {
          blogId: blogId,
        })
        .andWhere(`bb.isBanned = false`)
        .andWhere(`ubsa.isBanned = false`)
        .leftJoinAndSelect('p.blog', 'b')
        .leftJoinAndSelect('b.blogBan', 'bb')
        .leftJoinAndSelect('b.blogOwner', 'bo')
        .leftJoinAndSelect('bo.user', 'u')
        .leftJoinAndSelect('u.userBanBySA', 'ubsa')
        .orderBy(`p.${query.sortBy}`, query.sortDirection)
        .skip((query.pageNumber - 1) * query.pageSize)
        .take(query.pageSize)
        .getMany();

      const totalCount = await this.postsRepository
        .createQueryBuilder('p')
        .where(`b.id = :blogId`, {
          blogId: blogId,
        })
        .andWhere(`bb.isBanned = false`)
        .andWhere(`ubsa.isBanned = false`)
        .leftJoinAndSelect('p.blog', 'b')
        .leftJoinAndSelect('b.blogBan', 'bb')
        .leftJoinAndSelect('b.blogOwner', 'bo')
        .leftJoinAndSelect('bo.user', 'u')
        .leftJoinAndSelect('u.userBanBySA', 'ubsa')
        .getCount();

      return Paginator.paginate({
        pageNumber: query.pageNumber,
        pageSize: query.pageSize,
        totalCount: totalCount,
        items: await this.postsMapping(posts),
      });
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  private async postsMapping(posts: any): Promise<PostViewDto[]> {
    return posts.map((p) => {
      return {
        id: p.id.toString(),
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        blogId: p.blog.id.toString(),
        blogName: p.blog.name,
        createdAt: p.createdAt,
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatus.None,
          newestLikes: [],
        },
      };
    });
  }
}
