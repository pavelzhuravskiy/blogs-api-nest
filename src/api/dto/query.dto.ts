import { Transform } from 'class-transformer';
import { User } from '../entities/users/user.entity';

export class QueryDto {
  @Transform(({ value }) => {
    if (User.checkSortingField(value)) {
      return value;
    } else {
      return 'createdAt';
    }
  })
  sortBy = 'createdAt';

  @Transform(({ value }) => {
    if (value.toLowerCase() === 'asc') {
      return value;
    } else {
      return 'desc';
    }
  })
  sortDirection = 'desc';

  @Transform(({ value }) => {
    if (!isNaN(Number(value))) {
      return Number(value);
    } else {
      return 1;
    }
  })
  pageNumber = 1;

  @Transform(({ value }) => {
    if (!isNaN(Number(value))) {
      return Number(value);
    } else {
      return 10;
    }
  })
  pageSize = 10;
}
