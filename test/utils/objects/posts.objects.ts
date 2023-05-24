import {
  postContent,
  postShortDescription,
  postTitle,
  postUpdatedContent,
  postUpdatedShortDescription,
  postUpdatedTitle,
} from '../constants/posts.constants';
import { LikeStatus } from '../../../src/enums/like-status.enum';

export const postObject = {
  id: expect.any(String),
  title: postTitle,
  shortDescription: postShortDescription,
  content: postContent,
  blogId: expect.any(String),
  blogName: expect.any(String),
  createdAt: expect.any(String),
  extendedLikesInfo: {
    likesCount: 0,
    dislikesCount: 0,
    myStatus: LikeStatus.None,
    newestLikes: [],
  },
};

export const updatedPostObject = {
  id: expect.any(String),
  title: postUpdatedTitle,
  shortDescription: postUpdatedShortDescription,
  content: postUpdatedContent,
  blogId: expect.any(String),
  blogName: expect.any(String),
  createdAt: expect.any(String),
  extendedLikesInfo: {
    likesCount: 0,
    dislikesCount: 0,
    myStatus: LikeStatus.None,
    newestLikes: [],
  },
};
