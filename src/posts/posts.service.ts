import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from './schemas/post.entity';
import { PostsRepository } from './posts.repository';
import { PostInputDto } from './dto/post-input.dto';
import { CommentInputDto } from '../comments/dto/comment-input.dto';
import { Comment, CommentModelType } from '../comments/schemas/comment.entity';
import { CommentsRepository } from '../comments/comments.repository';
import { BlogsRepository } from '../blogs/blogs.repository';
import { ResultCode } from '../exceptions/exception-codes.enum';
import {
  blogIDField,
  blogNotFound,
  postIDField,
  postNotFound,
} from '../exceptions/exception.constants';
import { ExceptionResultType } from '../exceptions/types/exception-result.type';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    private readonly postsRepository: PostsRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly blogsRepository: BlogsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async createPost(
    postInputDto: PostInputDto,
    blogIdParam?: string,
  ): Promise<string | null> {
    const blogId = postInputDto.blogId || blogIdParam;

    const blog = await this.blogsRepository.findBlog(blogId);

    if (!blog) {
      return null;
    }

    const post = this.PostModel.createPost(postInputDto, this.PostModel, blog);

    await this.postsRepository.save(post);
    return post.id;
  }

  async updatePost(
    id: string,
    postInputDto: PostInputDto,
  ): Promise<ExceptionResultType<boolean>> {
    const post = await this.postsRepository.findPost(id);

    if (!post) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: postIDField,
        message: postNotFound,
      };
    }

    const blog = await this.blogsRepository.findBlog(postInputDto.blogId);

    if (!blog) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: blogIDField,
        message: blogNotFound,
      };
    }

    await post.updatePost(postInputDto);
    await this.postsRepository.save(post);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }

  async deletePost(id: string): Promise<boolean | null> {
    const post = await this.postsRepository.findPost(id);

    if (!post) {
      return null;
    }

    return this.postsRepository.deletePost(id);
  }

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
