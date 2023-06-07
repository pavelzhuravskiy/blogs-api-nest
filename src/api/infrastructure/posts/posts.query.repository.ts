import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  Post,
  PostLeanType,
  PostModelType,
} from '../../entities/_mongoose/post.entity';
import { PostViewModel } from '../../dto/posts/view/post.view.dto';
import { likeStatusFinder } from '../../_public/likes/helpers/like-status-finder';
import { LikeStatus } from '../../../enums/like-status.enum';
import { likesCounter } from '../../_public/likes/helpers/likes-counter';
import { BlogsMongooseRepository } from '../_mongoose/blogs/blogs.repository';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private readonly blogsRepository: BlogsMongooseRepository,
  ) {}
  // async findPosts(
  //   query: QueryDto,
  //   userId: string,
  //   blogId?: string,
  // ): Promise<Paginator<PostViewModel[]> | null> {
  //   if (blogId) {
  //     const blog = await this.blogsRepository.findBlog(blogId);
  //     if (!blog) {
  //       return null;
  //     }
  //   }
  //
  //   const posts = await pFind(
  //     this.PostModel,
  //     query.pageNumber,
  //     query.pageSize,
  //     pFilterPosts(blogId),
  //     pSort(query.sortBy, query.sortDirection),
  //   );
  //
  //   const totalCount = await this.PostModel.countDocuments(
  //     pFilterPosts(blogId),
  //   );
  //
  //   return Paginator.paginate({
  //     pageNumber: query.pageNumber,
  //     pageSize: query.pageSize,
  //     totalCount: totalCount,
  //     items: await this.postsMapping(posts, userId),
  //   });
  // }

  async findPost(
    postId: string,
    userId?: string,
  ): Promise<PostViewModel | null> {
    if (!mongoose.isValidObjectId(postId)) {
      return null;
    }

    const post = await this.PostModel.findOne({ _id: postId });

    if (
      !post ||
      post.blogInfo.blogOwnerIsBanned ||
      post.blogInfo.blogIsBanned
    ) {
      return null;
    }

    const status = likeStatusFinder(post, userId);
    const likesCount = likesCounter(post, LikeStatus.Like);
    const dislikesCount = likesCounter(post, LikeStatus.Dislike);

    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogInfo.blogId,
      blogName: post.blogInfo.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: likesCount,
        dislikesCount: dislikesCount,
        myStatus: status,
        newestLikes: post.likesInfo.users
          .filter((u) => u.likeStatus === LikeStatus.Like && !u.isBanned)
          .sort(
            (a, b) =>
              -a.addedAt.toISOString().localeCompare(b.addedAt.toISOString()),
          )
          .map((u) => {
            return {
              addedAt: u.addedAt.toISOString(),
              userId: u.userId,
              login: u.userLogin,
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
      const likesCount = likesCounter(p, LikeStatus.Like);
      const dislikesCount = likesCounter(p, LikeStatus.Dislike);

      return {
        id: p._id.toString(),
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        blogId: p.blogInfo.blogId,
        blogName: p.blogInfo.blogName,
        createdAt: p.createdAt,
        extendedLikesInfo: {
          likesCount: likesCount,
          dislikesCount: dislikesCount,
          myStatus: likeStatus,
          newestLikes: usersLikes
            .filter((u) => u.likeStatus === LikeStatus.Like && !u.isBanned)
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
