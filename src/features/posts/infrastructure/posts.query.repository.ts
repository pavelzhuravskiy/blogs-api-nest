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

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}
  async findPosts(
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

    if (!post || post.blogInfo.blogOwnerIsBanned) {
      return null;
    }

    const status = likeStatusFinder(post, userId);
    /*const likesCount = likesCounter(post, usersNotBanned, LikeStatus.Like);
    const dislikesCount = likesCounter(
      post,
      usersNotBanned,
      LikeStatus.Dislike,
    );*/

    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogInfo.blogId,
      blogName: post.blogInfo.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: status,
        newestLikes: post.likesInfo.users
          /*.filter(
            (p) =>
              p.likeStatus === LikeStatus.Like &&
              usersNotBanned.includes(p.userId),
          )*/
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
      const usersLikes = p.likesInfo.users;

      const likeStatus = likeStatusFinder(p, userId);
      // const likesCount = likesCounter(p, usersNotBanned, LikeStatus.Like);
      // const dislikesCount = likesCounter(p, usersNotBanned, LikeStatus.Dislike);

      return {
        id: p._id.toString(),
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        blogId: p.blogInfo.blogId,
        blogName: p.blogInfo.blogName,
        createdAt: p.createdAt,
        extendedLikesInfo: {
          likesCount: 0, // TODO
          dislikesCount: 0,
          myStatus: likeStatus,
          newestLikes: usersLikes
            /*.filter(
              (p) =>
                p.likeStatus === LikeStatus.Like &&
                usersNotBanned.includes(p.userId),
            )*/
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
