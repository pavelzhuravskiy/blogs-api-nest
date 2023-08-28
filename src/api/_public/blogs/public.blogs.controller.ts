import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlogQueryDto } from '../../dto/blogs/query/blog.query.dto';
import { exceptionHandler } from '../../../exceptions/exception.handler';
import {
  blogIDField,
  blogNotFound,
} from '../../../exceptions/exception.constants';
import { ResultCode } from '../../../enums/result-code.enum';
import { BlogsQueryRepository } from '../../infrastructure/repositories/blogs/blogs.query.repository';
import { PostQueryDto } from '../../dto/posts/query/post.query.dto';
import { UserIdFromHeaders } from '../../_auth/decorators/user-id-from-headers.decorator';
import { PostsQueryRepository } from '../../infrastructure/repositories/posts/posts.query.repository';

@Controller('blogs')
export class PublicBlogsController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  async findBlogs(@Query() query: BlogQueryDto) {
    return this.blogsQueryRepository.findBlogsForPublicUser(query);
  }

  @Get(':id')
  async findBlog(@Param('id') id: string) {
    const result = await this.blogsQueryRepository.findBlog(id);

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIDField);
    }

    return result;
  }

  @Get(':id/posts')
  async findPostsForBlog(
    @Query() query: PostQueryDto,
    @Param('id') blogId: string,
    @UserIdFromHeaders() userId: string,
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
