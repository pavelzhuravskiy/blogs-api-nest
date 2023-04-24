import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from './schemas/post.entity';
import { PostsRepository } from './posts.repository';
import { PostCreateDto } from './dto/post.create.dto';
import { PostViewModel } from './schemas/post.view';
import { PostUpdateDto } from './dto/post.update.dto';
import { CommentCreateDto } from '../comments/dto/comment.create.dto';
import { CommentViewModel } from '../comments/schemas/comment.view';
import { Comment, CommentModelType } from '../comments/schemas/comment.entity';
import { CommentsRepository } from '../comments/comments.repository';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    private readonly postsRepository: PostsRepository,
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async createPost(
    createPostDto: PostCreateDto,
    blogIdParam?: string,
  ): Promise<PostViewModel> {
    const blogId = createPostDto.blogId || blogIdParam;

    const blog = await this.postsRepository.findBlog(blogId);

    if (!blog) {
      throw new InternalServerErrorException(
        `Something went wrong during blog find operation`,
      );
    }

    const post = this.PostModel.createPost(createPostDto, this.PostModel, blog);
    return this.postsRepository.createPost(post);
  }

  async updatePost(id: string, updatePostDto: PostUpdateDto): Promise<Post> {
    const post = await this.postsRepository.findPost(id);

    if (!post) {
      throw new InternalServerErrorException(
        `Something went wrong during post find operation`,
      );
    }

    await post.updatePost(updatePostDto);
    return this.postsRepository.save(post);
  }

  async deletePost(id: string): Promise<boolean> {
    const post = await this.postsRepository.findPost(id);

    if (!post) {
      throw new InternalServerErrorException(
        `Something went wrong during blog find operation`,
      );
    }

    return this.postsRepository.deletePost(id);
  }

  async createComment(
    id: string,
    createCommentDto: CommentCreateDto,
  ): Promise<CommentViewModel> {
    const post = await this.postsRepository.findPost(id);

    if (!post) {
      throw new InternalServerErrorException(
        `Something went wrong during post find operation`,
      );
    }

    const comment = this.CommentModel.createComment(
      createCommentDto,
      this.CommentModel,
      post,
    );
    return this.commentsRepository.createComment(comment);
  }
}
