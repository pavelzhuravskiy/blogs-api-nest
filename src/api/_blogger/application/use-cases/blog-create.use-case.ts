import { BlogInputDto } from '../../../dto/blogs/input/blog.input.dto';
import { CommandHandler } from '@nestjs/cqrs';
import { Blog } from '../../../entities/blogs/blog.entity';
import { BlogBan } from '../../../entities/blogs/blog-ban.entity';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionBaseUseCase } from '../../../_common/application/use-cases/transaction-base.use-case';
import { UsersTransactionsRepository } from '../../../infrastructure/repositories/users/users.transactions.repository';
import { TransactionsRepository } from '../../../infrastructure/repositories/common/transactions.repository';

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
    protected readonly transactionsRepository: TransactionsRepository,
    protected readonly usersTransactionsRepository: UsersTransactionsRepository,
  ) {
    super(dataSource);
  }

  async doLogic(
    command: BlogCreateCommand,
    manager: EntityManager,
  ): Promise<number | null> {
    const user = await this.usersTransactionsRepository.findUserById(
      command.userId,
      manager,
    );

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

    const savedBlog = await this.transactionsRepository.save(blog, manager);

    // Create blog ban record
    const blogBan = new BlogBan();
    blogBan.blog = blog;
    blogBan.isBanned = false;
    blogBan.banDate = null;
    await this.transactionsRepository.save(blogBan, manager);

    // Return user id
    return savedBlog.id;
  }

  public async execute(command: BlogCreateCommand) {
    return super.execute(command);
  }
}
