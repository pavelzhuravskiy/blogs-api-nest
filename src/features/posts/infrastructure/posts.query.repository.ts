import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Paginator } from '../../../helpers/pagination/_paginator';
import { Post, PostLeanType, PostModelType } from '../post.entity';
import { PostViewModel } from '../dto/post.view.dto';
import { BlogsQueryRepository } from '../../blogs/infrastructure/blogs.query.repository';
import { QueryDto } from '../../_shared/dto/query.dto';
import { pFind } from '../../../helpers/pagination/pagination-find';
import { pSort } from '../../../helpers/pagination/pagination-sort';
import { pFilterPosts } from '../../../helpers/pagination/pagination-filter-posts';
import { likeStatusFinder } from '../../likes/helpers/like-status-finder';
import { LikeStatus } from '../../../enums/like-status.enum';
import { likesCounter } from '../../likes/helpers/likes-counter';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}
  async findPosts(
    blogsNotBanned: string[],
    usersNotBanned: string[],
    query: QueryDto,
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
      pFilterPosts(blogsNotBanned, blogId),
      pSort(query.sortBy, query.sortDirection),
    );

    const totalCount = await this.PostModel.countDocuments(
      pFilterPosts(blogsNotBanned, blogId),
    );

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: await this.postsMapping(usersNotBanned, posts, userId),
    });
  }

  async findPost(
    postId: string,
    userId?: string,
    blogsNotBanned?: string[],
    usersNotBanned?: string[],
  ): Promise<PostViewModel | null> {
    if (!mongoose.isValidObjectId(postId)) {
      return null;
    }

    let post = await this.PostModel.findOne({ _id: postId });

    if (blogsNotBanned) {
      post = await this.PostModel.findOne({
        $and: [{ blogId: { $in: blogsNotBanned } }, { _id: postId }],
      });
    }

    if (!post) {
      return null;
    }

    const status = likeStatusFinder(post, userId);
    const likesCount = likesCounter(post, usersNotBanned, LikeStatus.Like);
    const dislikesCount = likesCounter(
      post,
      usersNotBanned,
      LikeStatus.Dislike,
    );

    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: likesCount,
        dislikesCount: dislikesCount,
        myStatus: status,
        newestLikes: post.likesInfo.users
          .filter(
            (p) =>
              p.likeStatus === LikeStatus.Like &&
              usersNotBanned.includes(p.userId),
          )
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
    usersNotBanned: string[],
    posts: PostLeanType[],
    userId: string,
  ): Promise<PostViewModel[]> {
    return posts.map((p) => {
      const usersLikes = p.likesInfo.users;

      const likeStatus = likeStatusFinder(p, userId);
      const likesCount = likesCounter(p, usersNotBanned, LikeStatus.Like);
      const dislikesCount = likesCounter(p, usersNotBanned, LikeStatus.Dislike);

      return {
        id: p._id.toString(),
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        blogId: p.blogId,
        blogName: p.blogName,
        createdAt: p.createdAt,
        extendedLikesInfo: {
          likesCount: likesCount,
          dislikesCount: dislikesCount,
          myStatus: likeStatus,
          newestLikes: usersLikes
            .filter(
              (p) =>
                p.likeStatus === LikeStatus.Like &&
                usersNotBanned.includes(p.userId),
            )
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
