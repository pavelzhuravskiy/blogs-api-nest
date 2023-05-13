import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Paginator } from '../helpers/pagination/_paginator';
import { Post, PostLeanType, PostModelType } from './schemas/post.entity';
import { PostViewModel } from './schemas/post.view';
import { BlogsQueryRepository } from '../blogs/blogs.query.repository';
import { CommonQueryDto } from '../common/dto/common-query.dto';
import { pFind } from '../helpers/pagination/pagination-find';
import { pSort } from '../helpers/pagination/pagination-sort';
import { pFilterPosts } from '../helpers/pagination/pagination-filter-posts';
import { likeStatusFinder } from '../likes/like-status-finder';
import { LikeStatus } from '../likes/like-status.enum';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}
  async findPosts(
    query: CommonQueryDto,
    userId: string,
    blogId?: string,
  ): Promise<Paginator<PostViewModel[]> | null> {
    if (blogId) {
      const blog = await this.blogsQueryRepository.findBlog(blogId);

      if (!blog) {
        return null;
      }
    }

    const posts = await pFind(
      this.PostModel,
      query.pageNumber,
      query.pageSize,
      pFilterPosts(blogId),
      pSort(query.sortBy, query.sortDirection),
    );

    const totalCount = await this.PostModel.countDocuments(
      pFilterPosts(blogId),
    );

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: await this.postsMapping(posts, userId),
    });
  }

  async findPost(
    postId: string,
    userId?: string,
  ): Promise<PostViewModel | null> {
    if (!mongoose.isValidObjectId(postId)) {
      return null;
    }

    const post = await this.PostModel.findOne({ _id: postId });

    if (!post) {
      return null;
    }

    const status = likeStatusFinder(post, userId);

    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt.toISOString(),
      extendedLikesInfo: {
        likesCount: post.likesInfo.likesCount,
        dislikesCount: post.likesInfo.dislikesCount,
        myStatus: status,
        newestLikes: post.likesInfo.users
          .filter((p) => p.likeStatus === LikeStatus.Like)
          .sort(
            (a, b) =>
              -a.addedAt.toISOString().localeCompare(b.addedAt.toISOString()),
          )
          .map((p) => {
            return {
              addedAt: p.addedAt.toISOString(),
              userId: p.userId,
              login: p.userLogin,
            };
          })
          .splice(0, 3),
      },
    };
  }

  private async postsMapping(
    posts: PostLeanType[],
    userId: string,
  ): Promise<PostViewModel[]> {
    return posts.map((p) => {
      const status = likeStatusFinder(p, userId);
      const usersLikes = p.likesInfo.users;

      return {
        id: p._id.toString(),
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        blogId: p.blogId,
        blogName: p.blogName,
        createdAt: p.createdAt.toISOString(),
        extendedLikesInfo: {
          likesCount: p.likesInfo.likesCount,
          dislikesCount: p.likesInfo.dislikesCount,
          myStatus: status,
          newestLikes: usersLikes
            .filter((p) => p.likeStatus === LikeStatus.Like)
            .sort(
              (a, b) =>
                -a.addedAt.toISOString().localeCompare(b.addedAt.toISOString()),
            )
            .map((p) => {
              return {
                addedAt: p.addedAt.toISOString(),
                userId: p.userId,
                login: p.userLogin,
              };
            })
            .splice(0, 3),
        },
      };
    });
  }
}
