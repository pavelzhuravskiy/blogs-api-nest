import { QueryDto } from '../../../query.dto';
import { Transform } from 'class-transformer';
import { User } from '../../../../entities/users/user.entity';

export class BloggerUserBanQueryDto extends QueryDto {
  @Transform(({ value }) => {
    if (User.checkSortingField(value)) {
      return value;
    } else {
      return 'createdAt';
    }
  })
  sortBy = 'createdAt';

  searchLoginTerm: string;
}
