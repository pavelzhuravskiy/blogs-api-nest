import { BlogInputDto } from '../../../dto/blogs/input/blog.input.dto';
import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/repositories/users/users.repository';
import { BlogsRepository } from '../../../infrastructure/repositories/blogs/blogs.repository';
import { Blog } from '../../../entities/blogs/blog.entity';
import { BlogBan } from '../../../entities/blogs/blog-ban.entity';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionBaseUseCase } from '../../../_common/application/use-cases/transaction-base.use-case';

export class BlogCreateCommand {
  constructor(public blogInputDto: BlogInputDto, public userId: number) {}
}

@CommandHandler(BlogCreateCommand)
export class BlogCreateUseCase extends TransactionBaseUseCase<
  BlogCreateCommand,
  number | null
> {
  constructor(
    protected readonly dataSource: DataSource,
    protected readonly blogsRepository: BlogsRepository,
    protected readonly usersRepository: UsersRepository,
  ) {
    super(dataSource);
  }

  async doLogic(
    command: BlogCreateCommand,
    manager: EntityManager,
  ): Promise<number | null> {
    const user = await this.usersRepository.findUserById(command.userId);

    if (!user) {
      return null;
    }

    // Create blog
    const blog = new Blog();
    blog.user = user;
    blog.name = command.blogInputDto.name;
    blog.description = command.blogInputDto.description;
    blog.websiteUrl = command.blogInputDto.websiteUrl;
    blog.createdAt = new Date();

    const savedBlog = await this.blogsRepository.queryRunnerSave(blog, manager);

    // Create blog ban record
    const blogBan = new BlogBan();
    blogBan.blog = blog;
    blogBan.isBanned = false;
    blogBan.banDate = null;
    await this.blogsRepository.queryRunnerSave(blogBan, manager);

    // Return user id
    return savedBlog.id;
  }
}
