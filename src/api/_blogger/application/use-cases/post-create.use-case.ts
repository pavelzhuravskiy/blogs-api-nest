import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExceptionResultType } from '../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../enums/result-code.enum';
import {
  blogIDField,
  blogNotFound,
} from '../../../../exceptions/exception.constants';
import { PostInputDto } from '../../../dto/posts/input/post.input.dto';
import { PostsRepository } from '../../../infrastructure/repositories/posts/posts.repository';
import { BlogsRepository } from '../../../infrastructure/repositories/blogs/blogs.repository';
import { Post } from '../../../entities/posts/post.entity';

export class PostCreateCommand {
  constructor(
    public postInputDto: PostInputDto,
    public blogId: string,
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
    const blog = await this.blogsRepository.findBlogWithOwner(command.blogId);

    if (!blog) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: blogIDField,
        message: blogNotFound,
      };
    }

    if (blog.blogOwner.user.id !== command.userId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    const post = new Post();
    post.blog = blog;
    post.title = command.postInputDto.title;
    post.shortDescription = command.postInputDto.shortDescription;
    post.content = command.postInputDto.content;
    post.createdAt = new Date();
    const savedPost = await this.postsRepository.dataSourceSave(post);

    return {
      data: true,
      code: ResultCode.Success,
      response: savedPost.id,
    };
  }
}
