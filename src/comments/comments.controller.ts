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
import { CurrentUserId } from '../auth/decorators/current-user-id.param.decorator';
import { CommentsService } from './comments.service';
import { CommentInputDto } from './dto/comment-input.dto';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get(':id')
  async findComment(@Param('id') id: string) {
    const result = await this.commentsQueryRepository.findComment(id);

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
    @CurrentUserId() currentUserId: string,
    @Param('id') commentId: string,
    @Body() commentInputDto: CommentInputDto,
  ) {
    const result = await this.commentsService.updateComment(
      currentUserId,
      commentId,
      commentInputDto,
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @UseGuards(JwtBearerGuard) // TODO
  @Put(':id/like-status')
  @HttpCode(204)
  async updateLikeStatus(
    @CurrentUserId() currentUserId: string,
    @Param('id') commentId: string,
    @Body() commentInputDto: CommentInputDto,
  ) {
    /*const result = await this.commentsService.updateComment(
      currentUserId,
      commentId,
      updateCommentDto,
    );

    if (result.code !== ExceptionCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }*/

    return 1;
  }

  @UseGuards(JwtBearerGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteComment(
    @CurrentUserId() currentUserId: string,
    @Param('id') commentId: string,
  ) {
    const result = await this.commentsService.deleteComment(
      currentUserId,
      commentId,
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }
}
