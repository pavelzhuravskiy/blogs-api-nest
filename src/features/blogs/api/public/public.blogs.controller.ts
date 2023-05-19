import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query.repository';
import { BlogQueryDto } from '../../dto/blog.query.dto';
import { Role } from '../../../../enums/role.enum';
import { QueryDto } from 'src/features/_shared/dto/query.dto';
import { PostsQueryRepository } from '../../../posts/infrastructure/posts.query.repository';
import { UserIdFromHeaders } from '../../../auth/decorators/user-id-from-headers.decorator';
import { exceptionHandler } from '../../../../exceptions/exception.handler';
import {
  blogIDField,
  blogNotFound,
} from '../../../../exceptions/exception.constants';
import { ResultCode } from '../../../../enums/result-code.enum';
import { CommandBus } from '@nestjs/cqrs';

@Controller('blogs')
export class PublicBlogsController {
  constructor(
    private commandBus: CommandBus,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  async findBlogs(@Query() query: BlogQueryDto) {
    const role = Role.User;
    return this.blogsQueryRepository.findBlogs(query, role);
  }

  @Get(':id')
  async findBlog(@Param('id') id) {
    const result = await this.blogsQueryRepository.findBlog(id);

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIDField);
    }

    return result;
  }

  @Get(':id/posts')
  async findPosts(
    @Query() query: QueryDto,
    @Param('id') blogId,
    @UserIdFromHeaders() userId,
  ) {
    const result = await this.postsQueryRepository.findPosts(
      query,
      userId,
      blogId,
    );

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIDField);
    }

    return result;
  }
}
