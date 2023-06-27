import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExceptionResultType } from '../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../enums/result-code.enum';
import {
  blogIDField,
  blogNotFound,
  postIDField,
  postNotFound,
} from '../../../../exceptions/exception.constants';
import { BlogsRepository } from '../../../infrastructure/repositories/blogs/blogs.repository';
import { PostsRepository } from '../../../infrastructure/repositories/posts/posts.repository';

export class PostDeleteCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public userId: number,
  ) {}
}

@CommandHandler(PostDeleteCommand)
export class PostDeleteUseCase implements ICommandHandler<PostDeleteCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
  ) {}

  async execute(
    command: PostDeleteCommand,
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

    await this.postsRepository.deletePost(post.id);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
