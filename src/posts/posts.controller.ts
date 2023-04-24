import { Body, Controller, Post } from '@nestjs/common';
import { PostCreateDto } from './dto/post.create.dto';
import { PostsService } from './posts.service';
import { PostsQueryRepository } from './posts.query.repository';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly postsService: PostsService,
  ) {}

  @Post()
  async createPost(@Body() createPostDto: PostCreateDto) {
    return this.postsService.createPost(createPostDto);
  }
  //
  // @Get()
  // async findBlogs(@Query() query: BlogQuery) {
  //   return this.blogsQueryRepository.findBlogs(query);
  // }
  //
  // @Get(':id')
  // async findBlog(@Param('id') id: string) {
  //   return this.blogsQueryRepository.findBlog(id);
  // }
  //
  // @Put(':id')
  // @HttpCode(204)
  // async updateBlog(
  //   @Param('id') id: string,
  //   @Body() updateBlogDto: BlogUpdateDto,
  // ) {
  //   return this.blogsService.updateBlog(id, updateBlogDto);
  // }
  //
  // @Delete(':id')
  // @HttpCode(204)
  // async deleteBlog(@Param('id') id: string) {
  //   return this.blogsService.deleteBlog(id);
  // }
}
