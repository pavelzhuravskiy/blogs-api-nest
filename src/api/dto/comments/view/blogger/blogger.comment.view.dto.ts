export class BloggerCommentViewDto {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: Date;
  postInfo: {
    id: string;
    title: string;
    blogId: string;
    blogName: string;
  };
}
