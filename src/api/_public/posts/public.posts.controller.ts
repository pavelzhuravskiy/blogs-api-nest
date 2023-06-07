import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PostsQueryRepository } from '../../infrastructure/posts/posts.query.repository';
import { exceptionHandler } from '../../../exceptions/exception.handler';
import { ResultCode } from '../../../enums/result-code.enum';
import {
  postIDField,
  postNotFound,
} from '../../../exceptions/exception.constants';
import { JwtBearerGuard } from '../../_auth/guards/jwt-bearer.guard';
import { UserIdFromGuard } from '../../_auth/decorators/user-id-from-guard.decorator';
import { UserIdFromHeaders } from '../../_auth/decorators/user-id-from-headers.decorator';
import { CommentInputDto } from '../../dto/comments/input/comment.input.dto';
import { CommentCreateCommand } from '../comments/application/use-cases/comment-create.use-case';
import { CommandBus } from '@nestjs/cqrs';
import { CommentsQueryRepository } from '../../infrastructure/comments/comments.query.repository';
import { LikeStatusInputDto } from '../../dto/likes/input/like-status.input.dto';
import { LikeUpdateForPostCommand } from '../likes/application/use-cases/like-update-for-post-use.case';

@Controller('posts')
export class PublicPostsController {
  constructor(
    private commandBus: CommandBus,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  /*@Get()
  async findPosts(@Query() query: QueryDto, @UserIdFromHeaders() userId) {
    return this.postsQueryRepository.findPosts(query, userId);
  }*/

  @Get(':id')
  async findPost(@Param('id') postId, @UserIdFromHeaders() userId) {
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
    @Param('id') postId,
    @UserIdFromGuard() userId,
  ) {
    const result = await this.commandBus.execute(
      new CommentCreateCommand(commentInputDto, postId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return this.commentsQueryRepository.findComment(result.response);
  }

  /*@Get(':id/comments')
  async findComments(
    @Query() query: QueryDto,
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
  }*/

  @UseGuards(JwtBearerGuard)
  @Put(':id/like-status')
  @HttpCode(204)
  async updateLikeStatus(
    @Body() likeStatusInputDto: LikeStatusInputDto,
    @Param('id') postId,
    @UserIdFromGuard() userId,
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
