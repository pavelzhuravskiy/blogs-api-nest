import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../../../../../blog.entity';
import { BlogInputDto } from '../../../../../dto/blog-input.dto';
import { BlogsRepository } from '../../../../../infrastructure/blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../../../users/infrastructure/users.repository';

export class BloggerCreateBlogCommand {
  constructor(public blogInputDto: BlogInputDto, public userId: string) {}
}

@CommandHandler(BloggerCreateBlogCommand)
export class BloggerCreateBlogUseCase
  implements ICommandHandler<BloggerCreateBlogCommand>
{
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    private readonly blogsRepository: BlogsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: BloggerCreateBlogCommand): Promise<string | null> {
    const user = await this.usersRepository.findUserById(command.userId);

    if (!user) {
      return null;
    }

    const blog = this.BlogModel.createBlog(
      this.BlogModel,
      command.blogInputDto,
      user,
    );
    await this.blogsRepository.save(blog);
    return blog.id;
  }
}
