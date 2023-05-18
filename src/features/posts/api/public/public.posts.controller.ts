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
import { PostsQueryRepository } from '../../infrastructure/posts.query.repository';
import { exceptionHandler } from '../../../../exceptions/exception.handler';
import { ResultCode } from '../../../../enums/result-code.enum';
import { QueryDto } from '../../../_shared/dto/query.dto';
import {
  postIDField,
  postNotFound,
} from '../../../../exceptions/exception.constants';
import { JwtBearerGuard } from '../../../auth/guards/jwt-bearer.guard';
import { UserIdFromGuard } from '../../../auth/decorators/user-id-from-guard.decorator';
import { UserIdFromHeaders } from '../../../auth/decorators/user-id-from-headers.decorator';
import { CommentInputDto } from '../../../comments/dto/comment.input.dto';
import { CommentCreateCommand } from '../../../comments/api/public/application/use-cases/comment-create.use-case';
import { CommandBus } from '@nestjs/cqrs';
import { CommentsQueryRepository } from '../../../comments/infrastructure/comments.query.repository';
import { LikeStatusInputDto } from '../../../likes/dto/like-status.input.dto';
import { LikeUpdateForPostCommand } from '../../../likes/api/public/application/use-cases/like-update-for-post-use.case';
import { BlogsFindNotBannedCommand } from '../../../blogs/api/superadmin/application/use-cases/blogs-find-not-banned-use.case';
import { UsersFindNotBannedCommand } from '../../../users/api/superadmin/application/use-cases/users-find-not-banned-use.case';

@Controller('posts')
export class PublicPostsController {
  constructor(
    private commandBus: CommandBus,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get()
  async findPosts(@Query() query: QueryDto, @UserIdFromHeaders() userId) {
    const blogsNotBanned = await this.commandBus.execute(
      new BlogsFindNotBannedCommand(),
    );

    const usersNotBanned = await this.commandBus.execute(
      new UsersFindNotBannedCommand(),
    );

    return this.postsQueryRepository.findPosts(
      blogsNotBanned,
      usersNotBanned,
      query,
      userId,
    );
  }

  @Get(':id')
  async findPost(@Param('id') postId, @UserIdFromHeaders() userId) {
    const blogsNotBanned = await this.commandBus.execute(
      new BlogsFindNotBannedCommand(),
    );

    const usersNotBanned = await this.commandBus.execute(
      new UsersFindNotBannedCommand(),
    );

    const result = await this.postsQueryRepository.findPost(
      postId,
      userId,
      blogsNotBanned,
      usersNotBanned,
    );

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
    const commentId = await this.commandBus.execute(
      new CommentCreateCommand(commentInputDto, postId, userId),
    );

    if (!commentId) {
      return exceptionHandler(ResultCode.NotFound, postNotFound, postIDField);
    }

    return this.commentsQueryRepository.findComment(commentId);
  }

  @Get(':id/comments')
  async findComments(
    @Query() query: QueryDto,
    @Param('id') postId,
    @UserIdFromHeaders() userId,
  ) {
    const usersNotBanned = await this.commandBus.execute(
      new UsersFindNotBannedCommand(),
    );

    const result = await this.commentsQueryRepository.findComments(
      usersNotBanned,
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
