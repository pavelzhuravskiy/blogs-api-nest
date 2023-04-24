import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from './schemas/post.entity';
import { PostsRepository } from './posts.repository';
import { PostCreateDto } from './dto/post.create.dto';
import { PostViewModel } from './schemas/post.view';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private readonly postsRepository: PostsRepository,
  ) {}

  async createPost(createPostDto: PostCreateDto): Promise<PostViewModel> {
    const blog = await this.postsRepository.findBlog(createPostDto.blogId);

    if (!blog) {
      throw new InternalServerErrorException(
        `Something went wrong during blog find operation`,
      );
    }

    const post = this.PostModel.createPost(createPostDto, this.PostModel, blog);
    return this.postsRepository.createPost(post);
  }

  // async updateBlog(id: string, updateBlogDto: BlogUpdateDto): Promise<Blog> {
  //   const blog = await this.blogsRepository.findBlog(id);
  //
  //   if (!blog) {
  //     throw new InternalServerErrorException(
  //       `Something went wrong during blog find operation`,
  //     );
  //   }
  //
  //   await blog.updateBlog(updateBlogDto);
  //   return this.blogsRepository.save(blog);
  // }
  //
  // async deleteBlog(id: string): Promise<boolean> {
  //   const blog = await this.blogsRepository.findBlog(id);
  //
  //   if (!blog) {
  //     throw new InternalServerErrorException(
  //       `Something went wrong during blog find operation`,
  //     );
  //   }
  //
  //   return this.blogsRepository.deleteBlog(id);
  // }
}
