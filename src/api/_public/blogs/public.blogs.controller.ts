import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlogQueryDto } from '../../dto/blogs/query/blog.query.dto';
import { Role } from '../../../enums/role.enum';
import { exceptionHandler } from '../../../exceptions/exception.handler';
import {
  blogIDField,
  blogNotFound,
} from '../../../exceptions/exception.constants';
import { ResultCode } from '../../../enums/result-code.enum';
import { CommandBus } from '@nestjs/cqrs';
import { BlogsQueryRepository } from '../../infrastructure/blogs/blogs.query.repository';
import { PostQueryDto } from '../../dto/posts/query/post.query.dto';
import { UserIdFromHeaders } from '../../_auth/decorators/user-id-from-headers.decorator';
import { PostsQueryRepository } from '../../infrastructure/posts/posts.query.repository';

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
    const role = Role.User;
    const result = await this.blogsQueryRepository.findBlog(id, role);

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIDField);
    }

    return result;
  }

  @Get(':id/posts')
  async findPostsForBlog(
    @Query() query: PostQueryDto,
    @Param('id') blogId,
    @UserIdFromHeaders() userId,
  ) {
    const result = await this.postsQueryRepository.findPostsForBlog(
      query,
      blogId,
      userId,
    );

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIDField);
    }

    return result;
  }
}
