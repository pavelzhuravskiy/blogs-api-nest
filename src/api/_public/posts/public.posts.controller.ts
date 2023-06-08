import { Controller, Get, Param, Query } from '@nestjs/common';
import { exceptionHandler } from '../../../exceptions/exception.handler';
import { ResultCode } from '../../../enums/result-code.enum';
import {
  postIDField,
  postNotFound,
} from '../../../exceptions/exception.constants';
import { UserIdFromHeaders } from '../../_auth/decorators/user-id-from-headers.decorator';
import { CommandBus } from '@nestjs/cqrs';
import { CommentsQueryRepository } from '../../infrastructure/_mongoose/comments/comments.query.repository';
import { PostsQueryRepository } from '../../infrastructure/posts/posts.query.repository';
import { PostQueryDto } from '../../dto/posts/query/post.query.dto';

@Controller('posts')
export class PublicPostsController {
  constructor(
    private commandBus: CommandBus,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get()
  async findPosts(@Query() query: PostQueryDto, @UserIdFromHeaders() userId) {
    return this.postsQueryRepository.findPosts(query /*, userId*/);
  }

  @Get(':id')
  async findPost(@Param('id') postId, @UserIdFromHeaders() userId) {
    const result = await this.postsQueryRepository.findPost(
      postId /*, userId*/,
    );

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, postNotFound, postIDField);
    }

    return result;
  }

  /*@UseGuards(JwtBearerGuard)
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
  }*/

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

  /*@UseGuards(JwtBearerGuard)
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
  }*/
}
