import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { exceptionHandler } from '../../../exceptions/exception.handler';
import { ResultCode } from '../../../enums/result-code.enum';
import {
  postIDField,
  postNotFound,
} from '../../../exceptions/exception.constants';
import { UserIdFromHeaders } from '../../_auth/decorators/user-id-from-headers.decorator';
import { CommandBus } from '@nestjs/cqrs';
import { PostsQueryRepository } from '../../infrastructure/repositories/posts/posts.query.repository';
import { PostQueryDto } from '../../dto/posts/query/post.query.dto';
import { UserIdFromGuard } from '../../_auth/decorators/user-id-from-guard.decorator';
import { JwtBearerGuard } from '../../_auth/guards/jwt-bearer.guard';
import { CommentInputDto } from '../../dto/comments/input/comment.input.dto';
import { CommentCreateCommand } from '../comments/application/use-cases/comment-create.use-case';
import { CommentsQueryRepository } from '../../infrastructure/repositories/comments/comments.query.repository';
import { CommentQueryDto } from '../../dto/comments/query/comment.query.dto';
import { LikeStatusInputDto } from '../../dto/likes/input/like-status.input.dto';
import { LikeUpdateForPostCommand } from '../likes/application/use-cases/like-update-for-post-use.case';

@Controller('posts')
export class PublicPostsController {
  constructor(
    private commandBus: CommandBus,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get()
  async findPosts(
    @Query() query: PostQueryDto,
    @UserIdFromHeaders() userId: string,
  ) {
    return this.postsQueryRepository.findPosts(query, userId);
  }

  @Get(':id')
  async findPost(
    @Param('id') postId: string,
    @UserIdFromHeaders() userId: string,
  ) {
    const result = await this.postsQueryRepository.findPost(postId, userId);

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, postNotFound, postIDField);
    }

    return result;
  }

  @UseGuards(JwtBearerGuard)
  @Post(':id/comments')
  async createComment(
    @Body() commentInputDto: CommentInputDto,
    @Param('id') postId: string,
    @UserIdFromGuard() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new CommentCreateCommand(commentInputDto, postId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return this.commentsQueryRepository.findComment(result.response, userId);
  }

  @Get(':id/comments')
  async findComments(
    @Query() query: CommentQueryDto,
    @Param('id') postId: string,
    @UserIdFromHeaders() userId: string,
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
    @Body() likeStatusInputDto: LikeStatusInputDto,
    @Param('id') postId: string,
    @UserIdFromGuard() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new LikeUpdateForPostCommand(likeStatusInputDto, postId, userId),
    );

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, postNotFound, postIDField);
    }

    return result;
  }
}
