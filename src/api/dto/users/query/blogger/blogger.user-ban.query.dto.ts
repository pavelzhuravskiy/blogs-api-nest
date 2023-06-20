import { QueryDto } from '../../../query.dto';

export class BloggerUserBanQueryDto extends QueryDto {
  /*@Transform(({ value }) => {
    if (User.checkSortingField(value)) {
      return value;
    } else {
      return 'createdAt';
    }
  })*/
  sortBy = 'createdAt';

  searchLoginTerm: string;
}
