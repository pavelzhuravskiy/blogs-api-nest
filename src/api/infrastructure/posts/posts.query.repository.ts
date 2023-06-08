import { Injectable } from '@nestjs/common';
import { PostViewDto } from '../../dto/posts/view/post.view.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikeStatus } from '../../../enums/like-status.enum';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async findPost(id: number): Promise<PostViewDto> {
    if (isNaN(id)) {
      return null;
    }

    const posts = await this.dataSource.query(
      `select p.id as "postId",
              p.title,
              p."shortDescription",
              p.content,
              b.id as "blogId",
              b.name as "blogName",
              p."createdAt"
       from posts p
                left join blogs b on b.id = p."blogId"
       where p.id = $1`,
      [id],
    );

    const mappedPosts = await this.postsMapping(posts);
    return mappedPosts[0];
  }

  private async postsMapping(posts: any): Promise<PostViewDto[]> {
    return posts.map((p) => {
      return {
        id: p.postId,
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        blogId: p.blogId,
        blogName: p.blogName,
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
