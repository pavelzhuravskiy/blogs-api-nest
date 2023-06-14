import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostInputDto } from '../../dto/posts/input/post.input.dto';
import { Post } from '../../entities/posts/post.entity';
import { idIsValid } from '../../../helpers/id-is-valid';

@Injectable()
export class PostsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createPost(
    postInputDto: PostInputDto,
    blogId: number,
  ): Promise<number> {
    const post = await this.dataSource.query(
      `insert into public.posts (title, "shortDescription", content,
                                 "blogId")
       values ($1, $2, $3, $4)
       returning id;`,
      [
        postInputDto.title,
        postInputDto.shortDescription,
        postInputDto.content,
        blogId,
      ],
    );
    return post[0].id;
  }

  async findPost(postId: string): Promise<Post | null> {
    if (!idIsValid(postId)) {
      return null;
    }

    const posts = await this.dataSource.query(
      `select id, "blogId"
       from public.posts
       where id = $1`,
      [postId],
    );

    return posts[0];
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

  async deletePost(postId: number): Promise<boolean> {
    const result = await this.dataSource.query(
      `delete
       from public.posts
       where id = $1;`,
      [postId],
    );
    return result[1] === 1;
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
