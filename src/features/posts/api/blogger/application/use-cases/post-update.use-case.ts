import { BlogsRepository } from '../../../../../blogs/infrastructure/blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExceptionResultType } from '../../../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../../../exceptions/enum/exception-codes.enum';
import {
  blogIDField,
  blogNotFound,
  postIDField,
  postNotFound,
} from '../../../../../../exceptions/exception.constants';
import { PostInputDto } from '../../../../dto/post.input.dto';
import { PostsRepository } from '../../../../infrastructure/posts.repository';

export class PostUpdateCommand {
  constructor(
    public postInputDto: PostInputDto,
    public blogId: string,
    public postId: string,
    public userId: string,
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
