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
import { PostInputDto } from './dto/post-input.dto';
import { PostsService } from './posts.service';
import { PostsQueryRepository } from './posts.query.repository';
import { CommentInputDto } from '../comments/dto/comment-input.dto';
import { CommentsQueryRepository } from '../comments/comments.query.repository';
import { exceptionHandler } from '../exceptions/exception.handler';
import { ResultCode } from '../exceptions/exception-codes.enum';
import { CommonQueryDto } from '../common/dto/common-query.dto';
import {
  blogIDField,
  blogNotFound,
  postIDField,
  postNotFound,
} from '../exceptions/exception.constants';
import { JwtBearerGuard } from '../auth/guards/jwt-bearer.guard';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { CurrentUserId } from '../auth/decorators/current-user-id.param.decorator';
import { LikeStatusInputDto } from '../likes/dto/like-status-input.dto';
import { LikesService } from '../likes/likes.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly postsService: PostsService,
    private readonly likesService: LikesService,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Post()
  async createPost(@Body() postInputDto: PostInputDto) {
    const postId = await this.postsService.createPost(postInputDto);

    if (!postId) {
      return exceptionHandler(ResultCode.BadRequest, blogNotFound, blogIDField);
    }

    return this.postsQueryRepository.findPost(postId);
  }

  @Get()
  async findPosts(@Query() query: CommonQueryDto) {
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
    @Body() postInputDto: PostInputDto,
  ) {
    const result = await this.postsService.updatePost(id, postInputDto);

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
    @Body() commentInputDto: CommentInputDto,
  ) {
    const commentId = await this.postsService.createComment(
      currentUserId,
      postId,
      commentInputDto,
    );

    if (!commentId) {
      return exceptionHandler(ResultCode.NotFound, postNotFound, postIDField);
    }

    return this.commentsQueryRepository.findComment(commentId);
  }

  @Get(':id/comments')
  async findComments(
    @Query() query: CommonQueryDto,
    @Param('id') postId: string,
  ) {
    const result = await this.commentsQueryRepository.findComments(
      query,
      postId,
    );

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, postNotFound, postIDField);
    }

    return result;
  }

  @UseGuards(JwtBearerGuard)
  @Put(':id/like-status')
  @HttpCode(204)
  async updateLikeStatus(
    @CurrentUserId() currentUserId,
    @Param('id') postId: string,
    @Body() likeStatusInputDto: LikeStatusInputDto,
  ) {
    const result = await this.likesService.updateLikeStatus(
      likeStatusInputDto.likeStatus,
      currentUserId,
      undefined,
      postId,
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }
}
