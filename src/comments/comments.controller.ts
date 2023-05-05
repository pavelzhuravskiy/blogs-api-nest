import { Controller, Get, Param } from '@nestjs/common';
import { CommentsQueryRepository } from './comments.query.repository';
import { exceptionHandler } from '../exceptions/exception.handler';
import { ExceptionCode } from '../exceptions/exception-codes.enum';
import {
  commentIDField,
  commentNotFound,
} from '../exceptions/exception.constants';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get(':id')
  async findComment(@Param('id') id: string) {
    const result = await this.commentsQueryRepository.findComment(id);

    if (!result) {
      return exceptionHandler(
        ExceptionCode.NotFound,
        commentNotFound,
        commentIDField,
      );
    }

    return result;
  }
}
