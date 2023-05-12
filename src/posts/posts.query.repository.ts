import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Paginator } from '../common/schemas/paginator';
import { Post, PostLeanType, PostModelType } from './schemas/post.entity';
import { PostViewModel } from './schemas/post.view';
import { BlogsQueryRepository } from '../blogs/blogs.query.repository';
import { CommonQueryDto } from '../common/dto/common-query.dto';
import { LikeStatus } from '../likes/like-status.enum';
import { pFind } from '../helpers/pagination/pagination-find';
import { pSort } from '../helpers/pagination/pagination-sort';
import { pFilterPosts } from '../helpers/pagination/pagination-filter-posts';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}
  async findPosts(
    query: CommonQueryDto,
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
      items: await this.postsMapping(posts),
    });
  }

  async findPost(id: string): Promise<PostViewModel | null> {
    if (!mongoose.isValidObjectId(id)) {
      return null;
    }

    const post = await this.PostModel.findOne({ _id: id });

    if (!post) {
      return null;
    }

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
        myStatus: LikeStatus.None,
        newestLikes: [],
      },
    };
  }

  private async postsMapping(posts: PostLeanType[]): Promise<PostViewModel[]> {
    return posts.map((p) => {
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
          myStatus: LikeStatus.None,
          newestLikes: [],
        },
      };
    });
  }
}
