import { BlogInputDto } from '../../../dto/blogs/input/blog.input.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/repositories/users/users.repository';
import { BlogsRepository } from '../../../infrastructure/repositories/blogs/blogs.repository';
import { Blog } from '../../../entities/blogs/blog.entity';
import { BlogBan } from '../../../entities/blogs/blog-ban.entity';
import { BlogOwner } from '../../../entities/blogs/blog-owner.entity';
import { DataSource } from 'typeorm';

export class BlogCreateCommand {
  constructor(public blogInputDto: BlogInputDto, public userId: number) {}
}

@CommandHandler(BlogCreateCommand)
export class BlogCreateUseCase implements ICommandHandler<BlogCreateCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly usersRepository: UsersRepository,
    private dataSource: DataSource,
  ) {}

  async execute(command: BlogCreateCommand): Promise<number | null> {
    const user = await this.usersRepository.findUserById(command.userId);

    if (!user) {
      return null;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const queryRunnerManager = queryRunner.manager;

    try {
      // Create blog
      const blog = new Blog();
      blog.name = command.blogInputDto.name;
      blog.description = command.blogInputDto.description;
      blog.websiteUrl = command.blogInputDto.websiteUrl;
      blog.createdAt = new Date();

      const savedBlog = await this.blogsRepository.queryRunnerSave(
        blog,
        queryRunnerManager,
      );

      // Create blog ban record
      const blogBan = new BlogBan();
      blogBan.blog = blog;
      blogBan.isBanned = false;
      blogBan.banDate = null;
      await this.blogsRepository.queryRunnerSave(blogBan, queryRunnerManager);

      // Create blog owner record
      const blogOwner = new BlogOwner();
      blogOwner.blog = blog;
      blogOwner.user = user;
      await this.blogsRepository.queryRunnerSave(blogOwner, queryRunnerManager);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Return user id
      return savedBlog.id;
    } catch (e) {
      // since we have errors - rollback the changes
      console.error(e);
      await queryRunner.rollbackTransaction();
      return null;
    } finally {
      // release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }
}
