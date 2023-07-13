import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SABlogBanInputDto } from '../../../../dto/users/input/superadmin/sa.blog-ban.input.dto';
import { BlogsRepository } from '../../../../infrastructure/repositories/blogs/blogs.repository';
import { DataSourceRepository } from '../../../../infrastructure/repositories/common/data-source.repository';

export class SABlogBanCommand {
  constructor(
    public saBlogBanInputDto: SABlogBanInputDto,
    public blogId: string,
  ) {}
}

@CommandHandler(SABlogBanCommand)
export class BlogBanUseCase implements ICommandHandler<SABlogBanCommand> {
  constructor(
    private readonly dataSourceRepository: DataSourceRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(command: SABlogBanCommand): Promise<boolean | null> {
    const blog = await this.blogsRepository.findBlogForBlogBan(command.blogId);

    if (!blog) {
      return null;
    }

    if (command.saBlogBanInputDto.isBanned) {
      blog.blogBan.blog = blog;
      blog.blogBan.isBanned = true;
      blog.blogBan.banDate = new Date();
      await this.dataSourceRepository.save(blog.blogBan);
    } else {
      blog.blogBan.blog = blog;
      blog.blogBan.isBanned = false;
      blog.blogBan.banDate = null;
      await this.dataSourceRepository.save(blog.blogBan);
    }

    return true;
  }
}
