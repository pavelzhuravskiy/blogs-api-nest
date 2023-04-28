import { Injectable } from '@nestjs/common';
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
import { BlogsRepository } from '../blogs/blogs.repository';
import { PostsQueryRepository } from './posts.query.repository';
import { CommentsQueryRepository } from '../comments/comments.query.repository';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    private readonly postsRepository: PostsRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async createPost(
    createPostDto: PostCreateDto,
    blogIdParam?: string,
  ): Promise<PostViewModel | null> {
    const blogId = createPostDto.blogId || blogIdParam;
    const blog = await this.blogsRepository.findBlog(blogId);

    if (!blog) {
      return null;
    }

    const post = this.PostModel.createPost(createPostDto, this.PostModel, blog);

    await this.postsRepository.save(post);
    return this.postsQueryRepository.findPost(post.id);
  }

  async updatePost(
    id: string,
    updatePostDto: PostUpdateDto,
  ): Promise<Post | null> {
    const post = await this.postsRepository.findPost(id);

    if (!post) {
      return null;
    }

    await post.updatePost(updatePostDto);
    return this.postsRepository.save(post);
  }

  async deletePost(id: string): Promise<boolean | null> {
    const post = await this.postsRepository.findPost(id);

    if (!post) {
      return null;
    }

    return this.postsRepository.deletePost(id);
  }

  async deletePosts(): Promise<boolean> {
    return this.postsRepository.deletePosts();
  }

  async createComment(
    id: string,
    createCommentDto: CommentCreateDto,
  ): Promise<CommentViewModel | null> {
    const post = await this.postsRepository.findPost(id);

    if (!post) {
      return null;
    }

    const comment = this.CommentModel.createComment(
      createCommentDto,
      this.CommentModel,
      post,
    );
    await this.commentsRepository.save(comment);
    return this.commentsQueryRepository.findComment(comment.id);
  }
}
