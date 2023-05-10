import { Injectable } from '@nestjs/common';
import mongoose, { FilterQuery, SortOrder } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Paginator } from '../common/schemas/paginator';
import { Post, PostDocument, PostModelType } from './schemas/post.entity';
import { PostViewModel } from './schemas/post.view';
import { BlogsQueryRepository } from '../blogs/blogs.query.repository';
import { CommonQuery } from '../common/dto/common.query';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}
  async findPosts(
    query: CommonQuery,
    blogId?: string,
  ): Promise<Paginator<PostViewModel[]> | null> {
    const filter: FilterQuery<PostDocument> = {};

    if (blogId) {
      const blog = await this.blogsQueryRepository.findBlog(blogId);

      if (!blog) {
        return null;
      }

      filter.blogId = blogId;
    }

    const sortingObj: { [key: string]: SortOrder } = {
      [query.sortBy]: query.sortDirection,
    };

    if (query.sortDirection === 'asc') {
      sortingObj[query.sortBy] = 'asc';
    }

    const posts = await this.PostModel.find(filter)
      .sort(sortingObj)
      .skip(
        +query.pageNumber > 0 ? (+query.pageNumber - 1) * +query.pageSize : 0,
      )
      .limit(+query.pageSize > 0 ? +query.pageSize : 0)
      .lean();

    const totalCount = await this.PostModel.countDocuments(filter);
    const pagesCount = Math.ceil(totalCount / +query.pageSize);

    return {
      pagesCount: pagesCount,
      page: +query.pageNumber,
      pageSize: +query.pageSize,
      totalCount,
      items: posts.map((post) => {
        return {
          id: post._id.toString(),
          title: post.title,
          shortDescription: post.shortDescription,
          content: post.content,
          blogId: post.blogId,
          blogName: post.blogName,
          createdAt: post.createdAt.toISOString(),
          extendedLikesInfo: {
            likesCount: post.extendedLikesInfo.likesCount,
            dislikesCount: post.extendedLikesInfo.dislikesCount,
            myStatus: 'None',
            newestLikes: [],
          },
        };
      }),
    };
  }

  async findPost(id: string): Promise<PostDocument | null> {
    if (!mongoose.isValidObjectId(id)) {
      return null;
    }

    const post = await this.PostModel.findOne({ _id: id });

    if (!post) {
      return null;
    }

    return post;
  }
}
