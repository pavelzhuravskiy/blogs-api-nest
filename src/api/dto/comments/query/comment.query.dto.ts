import { QueryDto } from '../../query.dto';
import { Transform } from 'class-transformer';
import { Comment } from '../../../entities/comments/comment.entity';

export class CommentQueryDto extends QueryDto {
  @Transform(({ value }) => {
    if (Comment.checkSortingField(value)) {
      return value;
    } else {
      return 'createdAt';
    }
  })
  sortBy = 'createdAt';
}
