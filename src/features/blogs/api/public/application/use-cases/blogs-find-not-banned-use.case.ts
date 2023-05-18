import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../../users/infrastructure/users.repository';
import { BlogsRepository } from '../../../../infrastructure/blogs.repository';

export class BlogsFindNotBannedCommand {}

@CommandHandler(BlogsFindNotBannedCommand)
export class BlogsFindNotBannedUseCase
  implements ICommandHandler<BlogsFindNotBannedCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute() {
    const users = await this.usersRepository.findNotBannedUsersIDs();
    const usersIDs = users.map((u) => u._id.toString());

    const blogs = await this.blogsRepository.findNotBannedBlogs(usersIDs);
    return blogs.map((b) => b._id.toString());
  }
}
