import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from './schemas/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
  ) {}
  async save(comment: CommentDocument) {
    return comment.save();
  }

  async createComment(comment: CommentDocument) {
    await comment.save();
    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt.toISOString(),
      likesInfo: {
        likesCount: comment.extendedLikesInfo.likesCount,
        dislikesCount: comment.extendedLikesInfo.dislikesCount,
        myStatus: 'None',
      },
    };
  }
  //
  // async findBlog(id: string): Promise<BlogDocument | null> {
  //   if (!mongoose.isValidObjectId(id)) {
  //     throw new NotFoundException();
  //   }
  //
  //   const blog = await this.BlogModel.findOne({ _id: id });
  //
  //   if (!blog) {
  //     throw new NotFoundException();
  //   }
  //
  //   return blog;
  // }
  //
  // async deleteBlog(id: string): Promise<boolean> {
  //   const blog = await this.BlogModel.deleteOne({ _id: id });
  //   return blog.deletedCount === 1;
  // }
}
