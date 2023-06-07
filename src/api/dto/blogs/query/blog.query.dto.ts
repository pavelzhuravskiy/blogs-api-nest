import { QueryDto } from '../../query.dto';
import { Transform } from 'class-transformer';
import { Blog } from '../../../entities/blogs/blog.entity';

export class BlogQueryDto extends QueryDto {
  @Transform(({ value }) => {
    if (Blog.checkSortingField(value)) {
      return value;
    } else {
      return 'createdAt';
    }
  })
  sortBy = 'createdAt';

  searchNameTerm: string;
}
