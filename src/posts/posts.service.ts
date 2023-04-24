import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from './schemas/post.entity';
import { PostsRepository } from './posts.repository';
import { PostCreateDto } from './dto/post.create.dto';
import { PostViewModel } from './schemas/post.view';
import { PostUpdateDto } from './dto/post.update.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private readonly postsRepository: PostsRepository,
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
}
