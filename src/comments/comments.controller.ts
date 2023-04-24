import { Controller, Get, Param } from '@nestjs/common';
import { CommentsQueryRepository } from './comments.query.repository';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get(':id')
  async findComment(@Param('id') id: string) {
    return this.commentsQueryRepository.findComment(id);
  }
}
