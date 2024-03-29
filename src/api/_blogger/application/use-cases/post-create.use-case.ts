import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExceptionResultType } from '../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../enums/result-code.enum';
import {
  blogIDField,
  blogNotFound,
} from '../../../../exceptions/exception.constants';
import { PostInputDto } from '../../../dto/posts/input/post.input.dto';
import { BlogsRepository } from '../../../infrastructure/repositories/blogs/blogs.repository';
import { Post } from '../../../entities/posts/post.entity';
import { DataSourceRepository } from '../../../infrastructure/repositories/common/data-source.repository';
import { BlogSubscribersRepository } from '../../../infrastructure/repositories/blogs/blog-subscribers.repository';
import { TelegramAdapter } from '../../../infrastructure/telegram/telegram.adapter';

export class PostCreateCommand {
  constructor(
    public postInputDto: PostInputDto,
    public blogId: string,
    public userId: string,
  ) {}
}

@CommandHandler(PostCreateCommand)
export class PostCreateUseCase implements ICommandHandler<PostCreateCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly blogSubscribersRepository: BlogSubscribersRepository,
    private readonly dataSourceRepository: DataSourceRepository,
    private readonly telegramAdapter: TelegramAdapter,
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

    if (blog.user.id !== command.userId) {
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
    const savedPost = await this.dataSourceRepository.save(post);
    await this.sendTelegramNotification(command.blogId, blog.name);

    return {
      data: true,
      code: ResultCode.Success,
      response: savedPost.id,
    };
  }

  private async sendTelegramNotification(
    blogId: string,
    blogName: string,
  ): Promise<any> {
    const listOfSubscribers =
      await this.blogSubscribersRepository.findSubscribersForTelegramNotification(
        blogId,
      );

    if (listOfSubscribers.length === 0) {
      return null;
    }

    const message = `New post published for blog "${blogName}"`;
    listOfSubscribers.forEach((s) => {
      return this.telegramAdapter.sendMessage(message, s.telegramId);
    });

    return listOfSubscribers;
  }
}
