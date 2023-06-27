import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExceptionResultType } from '../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../enums/result-code.enum';
import {
  blogIDField,
  blogNotFound,
  postIDField,
  postNotFound,
} from '../../../../exceptions/exception.constants';
import { PostInputDto } from '../../../dto/posts/input/post.input.dto';
import { PostsRepository } from '../../../infrastructure/repositories/posts/posts.repository';
import { BlogsRepository } from '../../../infrastructure/repositories/blogs/blogs.repository';

export class PostUpdateCommand {
  constructor(
    public postInputDto: PostInputDto,
    public blogId: string,
    public postId: string,
    public userId: number,
  ) {}
}

@CommandHandler(PostUpdateCommand)
export class PostUpdateUseCase implements ICommandHandler<PostUpdateCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
  ) {}

  async execute(
    command: PostUpdateCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const blog = await this.blogsRepository.findBlogWithOwner(command.blogId);

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

    if (blog.user.id !== command.userId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    post.title = command.postInputDto.title;
    post.shortDescription = command.postInputDto.shortDescription;
    post.content = command.postInputDto.content;

    await this.postsRepository.dataSourceSave(post);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
