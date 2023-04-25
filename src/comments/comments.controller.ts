import { Controller, Delete, Get, HttpCode, Param } from '@nestjs/common';
import { CommentsQueryRepository } from './comments.query.repository';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commentsService: CommentsService,
  ) {}

  @Get(':id')
  async findComment(@Param('id') id: string) {
    return this.commentsQueryRepository.findComment(id);
  }
  @Delete()
  @HttpCode(204)
  async deleteComments() {
    return this.commentsService.deleteComments();
  }
}
