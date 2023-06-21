import { Transform } from 'class-transformer';

export class QueryDto {
  @Transform(({ value }) => {
    if (value.toLowerCase() === 'asc') {
      return 'ASC';
    } else {
      return 'DESC';
    }
  })
  sortDirection: 'ASC' | 'DESC' = 'DESC';

  @Transform(({ value }) => {
    if (Number(value)) {
      return Number(value);
    } else {
      return 1;
    }
  })
  pageNumber = 1;

  @Transform(({ value }) => {
    if (Number(value)) {
      return Number(value);
    } else {
      return 10;
    }
  })
  pageSize = 10;
}
