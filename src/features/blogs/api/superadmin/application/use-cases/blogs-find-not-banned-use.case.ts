import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../../infrastructure/blogs.repository';
import { UsersFindNotBannedCommand } from '../../../../../users/api/superadmin/application/use-cases/users-find-not-banned-use.case';

export class BlogsFindNotBannedCommand {}

@CommandHandler(BlogsFindNotBannedCommand)
export class BlogsFindNotBannedUseCase
  implements ICommandHandler<BlogsFindNotBannedCommand>
{
  constructor(
    private commandBus: CommandBus,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute() {
    const usersNotBanned = await this.commandBus.execute(
      new UsersFindNotBannedCommand(),
    );

    const blogs = await this.blogsRepository.findNotBannedBlogs(usersNotBanned);
    return blogs.map((b) => b._id.toString());
  }
}
