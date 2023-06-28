import { QueryDto } from '../../query.dto';
import { Transform } from 'class-transformer';
import { Post } from '../../../entities/posts/post.entity';

export class PostQueryDto extends QueryDto {
  @Transform(({ value }) => {
    if (
      Post.checkSortingField(value) ||
      value === 'blogName' ||
      value === 'blogId'
    ) {
      return value;
    } else {
      return 'createdAt';
    }
  })
  sortBy = 'createdAt';
}
