export class BloggerCommentViewDto {
  id: string;
  content: string;
  createdAt: Date;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
  };
  postInfo: {
    blogId: string;
    blogName: string;
    id: string;
    title: string;
  };
}
