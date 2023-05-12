import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentsQueryRepository } from './comments.query.repository';
import { exceptionHandler } from '../exceptions/exception.handler';
import { ResultCode } from '../exceptions/exception-codes.enum';
import {
  commentIDField,
  commentNotFound,
} from '../exceptions/exception.constants';
import { JwtBearerGuard } from '../auth/guards/jwt-bearer.guard';
import { UserIdFromGuard } from '../auth/decorators/user-id-from-guard.param.decorator';
import { CommentsService } from './comments.service';
import { CommentInputDto } from './dto/comment-input.dto';
import { LikeStatusInputDto } from '../likes/dto/like-status-input.dto';
import { LikesService } from '../likes/likes.service';
import { JwtService } from '@nestjs/jwt';
import { UserIdFromHeaders } from '../auth/decorators/user-id-from-headers.param.decorator';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly likesService: LikesService,
    private readonly jwtService: JwtService,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get(':id')
  async findComment(@Param('id') commentId, @UserIdFromHeaders() userId) {
    const result = await this.commentsQueryRepository.findComment(
      commentId,
      userId,
    );

    if (!result) {
      return exceptionHandler(
        ResultCode.NotFound,
        commentNotFound,
        commentIDField,
      );
    }

    return result;
  }

  @UseGuards(JwtBearerGuard)
  @Put(':id')
  @HttpCode(204)
  async updateComment(
    @UserIdFromGuard() userId,
    @Param('id') commentId,
    @Body() commentInputDto: CommentInputDto,
  ) {
    const result = await this.commentsService.updateComment(
      userId,
      commentId,
      commentInputDto,
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @UseGuards(JwtBearerGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteComment(@UserIdFromGuard() userId, @Param('id') commentId) {
    const result = await this.commentsService.deleteComment(userId, commentId);

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @UseGuards(JwtBearerGuard)
  @Put(':id/like-status')
  @HttpCode(204)
  async updateLikeStatus(
    @UserIdFromGuard() userId,
    @Param('id') commentId,
    @Body() likeStatusInputDto: LikeStatusInputDto,
  ) {
    const result = await this.likesService.updateCommentLikes(
      commentId,
      userId,
      likeStatusInputDto.likeStatus,
    );

    if (!result) {
      return exceptionHandler(
        ResultCode.NotFound,
        commentNotFound,
        commentIDField,
      );
    }

    return result;
  }
}
