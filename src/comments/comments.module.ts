import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentsController } from './comments.controller';
import { CommentsQueryRepository } from './comments.query.repository';
import { CommentsRepository } from './comments.repository';
import { Comment, CommentSchema } from './schemas/comment.entity';
import { CommentsService } from './comments.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
  ],
  controllers: [CommentsController],
  providers: [CommentsService, CommentsRepository, CommentsQueryRepository],
  exports: [CommentsService, CommentsRepository, CommentsQueryRepository],
})
export class CommentsModule {}
