import { Controller, Delete, Get, HttpCode, Param } from '@nestjs/common';
import { CommentsQueryRepository } from './comments.query.repository';
import { CommentsService } from './comments.service';
import { exceptionHandler } from '../exceptions/exception.handler';
import { ErrorCodes } from '../common/enums/error-codes.enum';
import {
  commentIDField,
  commentNotFound,
} from '../exceptions/exception.constants';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commentsService: CommentsService,
  ) {}

  @Get(':id')
  async findComment(@Param('id') id: string) {
    const result = await this.commentsQueryRepository.findComment(id);

    if (!result) {
      return exceptionHandler(
        ErrorCodes.NotFound,
        commentNotFound,
        commentIDField,
      );
    }

    return result;
  }
  @Delete()
  @HttpCode(204)
  async deleteComments() {
    return this.commentsService.deleteComments();
  }
}
