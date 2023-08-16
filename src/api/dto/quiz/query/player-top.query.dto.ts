import { QueryDto } from '../../query.dto';

export class PlayerTopQueryDto extends QueryDto {
  /*@Transform(({ value }) => {
    if (Game.checkSortingField(value)) {
      return value;
    } else {
      return 'pairCreatedDate';
    }
  })*/
  sort: string | string[] | string[][];
}
