import { Game } from '../../../entities/quiz/game.entity';
import { QueryDto } from '../../query.dto';
import { Transform } from 'class-transformer';

export class GameQueryDto extends QueryDto {
  @Transform(({ value }) => {
    if (Game.checkSortingField(value)) {
      return value;
    } else {
      return 'pairCreatedDate';
    }
  })
  sortBy = 'pairCreatedDate';
}
