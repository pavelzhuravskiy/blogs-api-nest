import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsQueryRepository } from './posts.query.repository';
import { CommentsQueryRepository } from '../comments/comments.query.repository';
import { exceptionHandler } from '../exceptions/exception.handler';
import { ResultCode } from '../exceptions/exception-codes.enum';
import { CommonQueryDto } from '../common/dto/common-query.dto';
import { postIDField, postNotFound } from '../exceptions/exception.constants';
import { JwtBearerGuard } from '../auth/guards/jwt-bearer.guard';
import { UserIdFromGuard } from '../auth/decorators/user-id-from-guard.decorator';
import { LikeStatusInputDto } from '../likes/dto/like-status-input.dto';
import { LikesService } from '../likes/likes.service';
import { JwtService } from '@nestjs/jwt';
import { UserIdFromHeaders } from '../auth/decorators/user-id-from-headers.decorator';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly postsService: PostsService,
    private readonly likesService: LikesService,
    private readonly jwtService: JwtService,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get()
  async findPosts(@Query() query: CommonQueryDto, @UserIdFromHeaders() userId) {
    return this.postsQueryRepository.findPosts(query, userId);
  }

  @Get(':id')
  async findPost(@Param('id') id, @UserIdFromHeaders() userId) {
    const result = await this.postsQueryRepository.findPost(id, userId);

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, postNotFound, postIDField);
    }

    return result;
  }

  /*@UseGuards(JwtBearerGuard)
  @Post(':id/comments')
  async createComment(
    @UserIdFromGuard() userId,
    @Param('id') postId,
    @Body() commentInputDto: CommentInputDto,
  ) {
    const commentId = await this.postsService.createComment(
      userId,
      postId,
      commentInputDto,
    );

    if (!commentId) {
      return exceptionHandler(ResultCode.NotFound, postNotFound, postIDField);
    }

    return this.commentsQueryRepository.findComment(commentId);
  }*/

  @Get(':id/comments')
  async findComments(
    @Query() query: CommonQueryDto,
    @Param('id') postId,
    @UserIdFromHeaders() userId,
  ) {
    const result = await this.commentsQueryRepository.findComments(
      query,
      postId,
      userId,
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
    @UserIdFromGuard() userId,
    @Param('id') postId,
    @Body() likeStatusInputDto: LikeStatusInputDto,
  ) {
    const result = await this.likesService.updatePostLikes(
      postId,
      userId,
      likeStatusInputDto.likeStatus,
    );

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, postNotFound, postIDField);
    }

    return result;
  }
}
