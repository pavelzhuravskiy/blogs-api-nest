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
  UseGuards,
} from '@nestjs/common';
import { PostCreateDto } from './dto/post-create.dto';
import { PostsService } from './posts.service';
import { PostsQueryRepository } from './posts.query.repository';
import { PostUpdateDto } from './dto/post-update.dto';
import { CommentCreateDto } from '../comments/dto/comment-create.dto';
import { CommentsQueryRepository } from '../comments/comments.query.repository';
import { exceptionHandler } from '../exceptions/exception.handler';
import { ResultCode } from '../exceptions/exception-codes.enum';
import { CommonQuery } from '../common/dto/common.query';
import {
  blogIDField,
  blogNotFound,
  postIDField,
  postNotFound,
} from '../exceptions/exception.constants';
import { JwtBearerGuard } from '../auth/guards/jwt-bearer.guard';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { CurrentUserId } from '../auth/decorators/current-user-id.param.decorator';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly postsService: PostsService,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Post()
  async createPost(@Body() createPostDto: PostCreateDto) {
    const result = await this.postsService.createPost(createPostDto);

    if (!result) {
      return exceptionHandler(ResultCode.BadRequest, blogNotFound, blogIDField);
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
      return exceptionHandler(ResultCode.NotFound, postNotFound, postIDField);
    }

    return result;
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: PostUpdateDto,
  ) {
    const result = await this.postsService.updatePost(id, updatePostDto);

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deletePost(@Param('id') id: string) {
    const result = await this.postsService.deletePost(id);

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, postNotFound, postIDField);
    }

    return result;
  }

  @UseGuards(JwtBearerGuard)
  @Post(':id/comments')
  async createComment(
    @CurrentUserId() currentUserId: string,
    @Param('id') postId: string,
    @Body() createCommentDto: CommentCreateDto,
  ) {
    return this.postsService.createComment(
      currentUserId,
      postId,
      createCommentDto,
    );
  }

  @Get(':id/comments')
  async findComments(@Query() query: CommonQuery, @Param('id') postId: string) {
    const result = await this.commentsQueryRepository.findComments(
      query,
      postId,
    );

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, postNotFound, postIDField);
    }

    return result;
  }
}
