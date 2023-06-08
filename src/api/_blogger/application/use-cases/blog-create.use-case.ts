import { BlogInputDto } from '../../../dto/blogs/input/blog.input.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { BlogsRepository } from '../../../infrastructure/blogs/blogs.repository';

export class BlogCreateCommand {
  constructor(public blogInputDto: BlogInputDto, public userId: number) {}
}

@CommandHandler(BlogCreateCommand)
export class BlogCreateUseCase implements ICommandHandler<BlogCreateCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: BlogCreateCommand): Promise<number> {
    const user = await this.usersRepository.findUserById(command.userId);

    if (!user) {
      return null;
    }

    return this.blogsRepository.createBlog(
      command.blogInputDto,
      user.id,
      user.login,
    );
  }
}
