import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlogsQueryRepository } from './infrastructure/blogs.query.repository';
import { PostsService } from '../../posts/posts.service';
import { PostsQueryRepository } from '../../posts/posts.query.repository';
import { ResultCode } from '../../exceptions/exception-codes.enum';
import { exceptionHandler } from '../../exceptions/exception.handler';
import { CommonQueryDto } from '../../common/dto/common-query.dto';
import {
  blogIDField,
  blogNotFound,
} from '../../exceptions/exception.constants';
import { UserIdFromHeaders } from '../../auth/decorators/user-id-from-headers.decorator';

@Controller('blogs')
export class BlogsController {
  constructor(
    // private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  /*@UseGuards(BasicAuthGuard)
  @Post()
  async createBlog(@Body() blogInputDto: BlogInputDto) {
    const blogId = await this.blogsService.createBlog(blogInputDto);
    return this.blogsQueryRepository.findBlog(blogId);
  }*/

  /*@Get()
  async findBlogs(@Query() query: BlogQueryDto) {
    return this.blogsQueryRepository.findBlogs(query);
  }*/

  @Get(':id')
  async findBlog(@Param('id') id) {
    const result = await this.blogsQueryRepository.findBlog(id);

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIDField);
    }

    return result;
  }

  /*  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async updateBlog(@Param('id') id, @Body() blogInputDto: BlogInputDto) {
    const result = await this.blogsService.updateBlog(id, blogInputDto);

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIDField);
    }

    return result;
  }*/

  /*@UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(@Param('id') id) {
    const result = await this.blogsService.deleteBlog(id);

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIDField);
    }

    return result;
  }*/

  /*@UseGuards(BasicAuthGuard)
  @Post(':id/posts')
  async createPost(@Param('id') id, @Body() postInputDto: PostInputDto) {
    const postId = await this.postsService.createPost(postInputDto, id);

    if (!postId) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIDField);
    }

    return postId;
    // return this.postsQueryRepository.findPost(postId);
  }*/

  @Get(':id/posts')
  async findPosts(
    @Query() query: CommonQueryDto,
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
