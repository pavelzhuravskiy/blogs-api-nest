import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostInputDto } from '../../dto/posts/input/post.input.dto';
import { Post } from '../../entities/posts/post.entity';

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

  async findPost(id: number): Promise<Post | null> {
    if (isNaN(id)) {
      return null;
    }

    const posts = await this.dataSource.query(
      `select id
       from public.posts
       where id = $1`,
      [id],
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
}
