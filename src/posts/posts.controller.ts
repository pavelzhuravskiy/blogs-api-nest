import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PostCreateDto } from './dto/post.create.dto';
import { PostsService } from './posts.service';
import { PostsQueryRepository } from './posts.query.repository';
import { PostQuery } from './dto/post.query';
import { PostUpdateDto } from './dto/post.update.dto';
import { CommentCreateDto } from '../comments/dto/comment.create.dto';
import { CommentQuery } from '../comments/dto/comment.query';
import { CommentsQueryRepository } from '../comments/comments.query.repository';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly postsService: PostsService,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Post()
  async createPost(@Body() createPostDto: PostCreateDto) {
    return this.postsService.createPost(createPostDto);
  }

  @Get()
  async findPosts(@Query() query: PostQuery) {
    return this.postsQueryRepository.findPosts(query);
  }

  @Get(':id')
  async findPost(@Param('id') id: string) {
    return this.postsQueryRepository.findPost(id);
  }

  @Put(':id')
  @HttpCode(204)
  async updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: PostUpdateDto,
  ) {
    return this.postsService.updatePost(id, updatePostDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async deletePost(@Param('id') id: string) {
    return this.postsService.deletePost(id);
  }

  @Post('/:id/comments')
  async createComment(
    @Param('id') id: string,
    @Body() createCommentDto: CommentCreateDto,
  ) {
    return this.postsService.createComment(id, createCommentDto);
  }

  @Get('/:id/comments')
  async findComments(@Query() query: CommentQuery, @Param('id') id: string) {
    return this.commentsQueryRepository.findComments(query, id);
  }
}
