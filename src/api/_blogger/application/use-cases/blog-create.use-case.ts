import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../../../entities/blog.entity';
import { BlogInputDto } from '../../../dto/blogs/blog.input.dto';
import { BlogsRepository } from '../../../infrastructure/blogs/blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users/users.repository';

export class BlogCreateCommand {
  constructor(public blogInputDto: BlogInputDto, public userId: string) {}
}

@CommandHandler(BlogCreateCommand)
export class BlogCreateUseCase implements ICommandHandler<BlogCreateCommand> {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    private readonly blogsRepository: BlogsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: BlogCreateCommand): Promise<string | null> {
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
