import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from './schemas/post.entity';
import { PostsRepository } from './posts.repository';
import { CommentInputDto } from '../comments/dto/comment-input.dto';
import { Comment, CommentModelType } from '../comments/schemas/comment.entity';
import { CommentsRepository } from '../comments/comments.repository';
import { UsersRepository } from '../users/infrastructure/users.repository';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    private readonly postsRepository: PostsRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async createComment(
    currentUserId: string,
    postId: string,
    commentInputDto: CommentInputDto,
  ): Promise<string | null> {
    const post = await this.postsRepository.findPost(postId);

    if (!post) {
      return null;
    }

    const user = await this.usersRepository.findUserById(currentUserId);

    const comment = this.CommentModel.createComment(
      commentInputDto,
      this.CommentModel,
      post,
      user,
    );
    await this.commentsRepository.save(comment);
    return comment.id;
  }
}
