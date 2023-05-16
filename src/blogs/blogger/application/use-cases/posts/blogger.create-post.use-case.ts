import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../../../../blog.entity';
import { BlogsRepository } from '../../../../_common/infrastructure/blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExceptionResultType } from '../../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../../exceptions/exception-codes.enum';
import {
  blogIDField,
  blogNotFound,
  userIDField,
  userNotFound,
} from '../../../../../exceptions/exception.constants';
import { PostInputDto } from '../../../../../posts/dto/post-input.dto';
import { Post, PostModelType } from '../../../../../posts/schemas/post.entity';
import { PostsRepository } from '../../../../../posts/posts.repository';
import { UsersRepository } from '../../../../../users/_common/users.repository';

export class BloggerCreatePostCommand {
  constructor(
    public postInputDto: PostInputDto,
    public blogId: string,
    public userId: string,
  ) {}
}

@CommandHandler(BloggerCreatePostCommand)
export class BloggerCreatePostUseCase
  implements ICommandHandler<BloggerCreatePostCommand>
{
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(
    command: BloggerCreatePostCommand,
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

    if (blog.blogOwnerInfo.userId !== command.userId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    const user = await this.usersRepository.findUserById(command.userId);

    if (!user) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: userIDField,
        message: userNotFound,
      };
    }

    const post = this.PostModel.createPost(
      this.PostModel,
      command.postInputDto,
      blog,
    );

    await this.postsRepository.save(post);

    return {
      data: true,
      code: ResultCode.Success,
      response: post.id,
    };
  }
}
