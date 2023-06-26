import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PostInputDto } from '../../../dto/posts/input/post.input.dto';
import { Post } from '../../../entities/posts/post.entity';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post) private readonly postsRepository: Repository<Post>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  // ***** TypeORM data source manager SAVE *****
  async dataSourceSave(entity: Post): Promise<Post> {
    return this.dataSource.manager.save(entity);
  }

  // ***** Find post operations *****
  async findPost(postId: string): Promise<Post | null> {
    try {
      return await this.postsRepository
        .createQueryBuilder('p')
        .where(`p.id = :postId`, {
          postId: postId,
        })
        .getOne();
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async updatePost(
    postInputDto: PostInputDto,
    postId: number,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `update public.posts
       set "title"            = $1,
           "shortDescription" = $2,
           "content"          = $3
       where "id" = $4`,
      [
        postInputDto.title,
        postInputDto.shortDescription,
        postInputDto.content,
        postId,
      ],
    );
    return result[1] === 1;
  }

  // ***** Delete operations *****
  async deletePost(postId: number): Promise<boolean> {
    const result = await this.postsRepository
      .createQueryBuilder('p')
      .delete()
      .from(Post)
      .where('id = :postId', { postId: postId })
      .execute();
    return result.affected === 1;
  }

  async findUserPostLikeRecord(
    postId: number,
    userId: number,
  ): Promise<number | null> {
    const posts = await this.dataSource.query(
      `select id
       from public.post_likes
       where "postId" = $1
         and "userId" = $2;`,
      [postId, userId],
    );

    if (posts.length === 0) {
      return null;
    }

    return posts[0];
  }

  async updateLikeStatus(
    likeStatus: string,
    postId: number,
    userId: number,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `update public.post_likes
       set "likeStatus" = $1
       where "postId" = $2
         and "userId" = $3`,
      [likeStatus, postId, userId],
    );
    return result[1] === 1;
  }

  async createUserPostLikeRecord(
    postId: number,
    userId: number,
    likeStatus: string,
  ): Promise<number | null> {
    return this.dataSource.query(
      `insert into public.post_likes("addedAt", "postId", "userId", "likeStatus")
       values (now(), $1, $2, $3)
       returning id;`,
      [postId, userId, likeStatus],
    );
  }
}
