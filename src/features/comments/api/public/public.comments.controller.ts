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
import { CommentsQueryRepository } from '../../infrastructure/comments.query.repository';
import { exceptionHandler } from '../../../../exceptions/exception.handler';
import { ResultCode } from '../../../../enums/result-code.enum';
import {
  commentIDField,
  commentNotFound,
} from '../../../../exceptions/exception.constants';
import { JwtBearerGuard } from '../../../auth/guards/jwt-bearer.guard';
import { UserIdFromGuard } from '../../../auth/decorators/user-id-from-guard.decorator';
import { CommentInputDto } from '../../dto/comment.input.dto';
import { UserIdFromHeaders } from '../../../auth/decorators/user-id-from-headers.decorator';
import { CommentUpdateCommand } from './application/use-cases/comment-update.use-case';
import { CommandBus } from '@nestjs/cqrs';
import { CommentDeleteCommand } from './application/use-cases/comment-delete.use-case';
import { LikeStatusInputDto } from '../../../likes/dto/like-status.input.dto';
import { LikeUpdateForCommentCommand } from '../../../likes/api/public/application/use-cases/like-update-for-comment-use.case';
import { UsersFindNotBannedCommand } from '../../../users/api/superadmin/application/use-cases/users-find-not-banned-use.case';

@Controller('comments')
export class PublicCommentsController {
  constructor(
    private commandBus: CommandBus,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get(':id')
  async findComment(@Param('id') commentId, @UserIdFromHeaders() userId) {
    const usersNotBanned = await this.commandBus.execute(
      new UsersFindNotBannedCommand(),
    );

    const result = await this.commentsQueryRepository.findComment(
      commentId,
      userId,
      usersNotBanned,
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
    @Body() commentInputDto: CommentInputDto,
    @Param('id') commentId,
    @UserIdFromGuard() userId,
  ) {
    const result = await this.commandBus.execute(
      new CommentUpdateCommand(commentInputDto, commentId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @UseGuards(JwtBearerGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteComment(@Param('id') commentId, @UserIdFromGuard() userId) {
    const result = await this.commandBus.execute(
      new CommentDeleteCommand(commentId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @UseGuards(JwtBearerGuard)
  @Put(':id/like-status')
  @HttpCode(204)
  async updateLikeStatus(
    @Body() likeStatusInputDto: LikeStatusInputDto,
    @Param('id') commentId,
    @UserIdFromGuard() userId,
  ) {
    const result = await this.commandBus.execute(
      new LikeUpdateForCommentCommand(likeStatusInputDto, commentId, userId),
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