import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExceptionResultType } from '../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../enums/result-code.enum';
import {
  blogIDField,
  blogNotFound,
} from '../../../../exceptions/exception.constants';
import { PostInputDto } from '../../../dto/posts/input/post.input.dto';
import { PostsRepository } from '../../../infrastructure/posts/posts.repository';
import { BlogsRepository } from '../../../infrastructure/blogs/blogs.repository';

export class PostCreateCommand {
  constructor(
    public postInputDto: PostInputDto,
    public blogId: number,
    public userId: number,
  ) {}
}

@CommandHandler(PostCreateCommand)
export class PostCreateUseCase implements ICommandHandler<PostCreateCommand> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(
    command: PostCreateCommand,
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

    if (blog.ownerId !== command.userId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    const postId = await this.postsRepository.createPost(
      command.postInputDto,
      blog.id,
    );

    return {
      data: true,
      code: ResultCode.Success,
      response: postId,
    };
  }
}
