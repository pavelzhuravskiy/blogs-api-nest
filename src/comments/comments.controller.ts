import { Controller, Delete, Get, HttpCode, Param } from '@nestjs/common';
import { CommentsQueryRepository } from './comments.query.repository';
import { CommentsService } from './comments.service';
import { errorHandler } from '../common/helpers/error.handler';
import { ErrorCodes } from '../common/enums/error.codes';

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
      return errorHandler(ErrorCodes.NotFound);
    }

    return result;
  }
  @Delete()
  @HttpCode(204)
  async deleteComments() {
    return this.commentsService.deleteComments();
  }
}
