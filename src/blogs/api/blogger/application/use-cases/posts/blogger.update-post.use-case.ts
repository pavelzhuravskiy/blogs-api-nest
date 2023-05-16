import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../../../../../blog.entity';
import { BlogsRepository } from '../../../../../infrastructure/blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExceptionResultType } from '../../../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../../../exceptions/exception-codes.enum';
import {
  blogIDField,
  blogNotFound,
  postIDField,
  postNotFound,
} from '../../../../../../exceptions/exception.constants';
import { PostInputDto } from '../../../../../../posts/dto/post-input.dto';
import {
  Post,
  PostModelType,
} from '../../../../../../posts/schemas/post.entity';
import { PostsRepository } from '../../../../../../posts/posts.repository';

export class BloggerUpdatePostCommand {
  constructor(
    public postInputDto: PostInputDto,
    public blogId: string,
    public postId: string,
    public userId: string,
  ) {}
}

@CommandHandler(BloggerUpdatePostCommand)
export class BloggerUpdatePostUseCase
  implements ICommandHandler<BloggerUpdatePostCommand>
{
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
  ) {}

  async execute(
    command: BloggerUpdatePostCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const blog = await this.blogsRepository.findBlog(command.blogId);

    if (!blog) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: blogIDField,
        message: blogNotFound,
      };
    }

    const post = await this.postsRepository.findPost(command.postId);

    if (!post) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: postIDField,
        message: postNotFound,
      };
    }

    if (blog.blogOwnerInfo.userId !== command.userId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    post.updatePost(command.postInputDto);
    await this.postsRepository.save(post);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
