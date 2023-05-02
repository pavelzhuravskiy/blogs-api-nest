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
import { PostCreateDto } from './dto/post-create.dto';
import { PostsService } from './posts.service';
import { PostsQueryRepository } from './posts.query.repository';
import { PostUpdateDto } from './dto/post-update.dto';
import { CommentCreateDto } from '../comments/dto/comment-create.dto';
import { CommentsQueryRepository } from '../comments/comments.query.repository';
import { exceptionHandler } from '../exceptions/exception.handler';
import { ExceptionCodes } from '../exceptions/exception-codes.enum';
import { CommonQuery } from '../common/dto/common.query';
import {
  blogIDField,
  blogNotFound,
  postIDField,
  postNotFound,
} from '../exceptions/exception.constants';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly postsService: PostsService,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Post()
  async createPost(@Body() createPostDto: PostCreateDto) {
    const result = await this.postsService.createPost(createPostDto);

    if (!result) {
      return exceptionHandler(
        ExceptionCodes.BadRequest,
        blogNotFound,
        blogIDField,
      );
    }

    return result;
  }

  @Get()
  async findPosts(@Query() query: CommonQuery) {
    return this.postsQueryRepository.findPosts(query);
  }

  @Get(':id')
  async findPost(@Param('id') id: string) {
    const result = await this.postsQueryRepository.findPost(id);

    if (!result) {
      return exceptionHandler(
        ExceptionCodes.NotFound,
        postNotFound,
        postIDField,
      );
    }

    return result;
  }

  @Put(':id')
  @HttpCode(204)
  async updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: PostUpdateDto,
  ) {
    const result = await this.postsService.updatePost(id, updatePostDto);

    if (result.code !== ExceptionCodes.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @Delete(':id')
  @HttpCode(204)
  async deletePost(@Param('id') id: string) {
    const result = await this.postsService.deletePost(id);

    if (!result) {
      return exceptionHandler(
        ExceptionCodes.NotFound,
        postNotFound,
        postIDField,
      );
    }

    return result;
  }

  @Delete()
  @HttpCode(204)
  async deletePosts() {
    return this.postsService.deletePosts();
  }

  @Post('/:id/comments')
  async createComment(
    @Param('id') id: string,
    @Body() createCommentDto: CommentCreateDto,
  ) {
    return this.postsService.createComment(id, createCommentDto);
  }

  @Get('/:id/comments')
  async findComments(@Query() query: CommonQuery, @Param('id') id: string) {
    return this.commentsQueryRepository.findComments(query, id);
  }
}
