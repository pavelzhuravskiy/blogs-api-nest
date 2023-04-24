import { Injectable, NotFoundException } from '@nestjs/common';
import mongoose, { FilterQuery, SortOrder } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Paginator } from '../common/schemas/paginator';
import { Post, PostDocument, PostModelType } from './schemas/post.entity';
import { PostQuery } from './dto/post.query';
import { PostViewModel } from './schemas/post.view';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
  ) {}
  async findPosts(
    query: PostQuery,
    blogId?: string,
  ): Promise<Paginator<PostViewModel[]>> {
    const filter: FilterQuery<PostDocument> = {};

    if (blogId) {
      filter.blogId = blogId;
    }

    const sortingObj: { [key: string]: SortOrder } = {
      [query.sortBy || 'createdAt']: 'desc',
    };

    if (query.sortDirection === 'asc') {
      sortingObj[query.sortBy || 'createdAt'] = 'asc';
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
      pagesCount: pagesCount || 1,
      page: +query.pageNumber || 1,
      pageSize: +query.pageSize || 10,
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

  async findPost(id: string): Promise<PostViewModel> {
    if (!mongoose.isValidObjectId(id)) {
      throw new NotFoundException();
    }

    const post = await this.PostModel.findOne({ _id: id });

    if (!post) {
      throw new NotFoundException();
    }

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
  }
}
