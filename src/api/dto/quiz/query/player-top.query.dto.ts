import { QueryDto } from '../../query.dto';
import { Transform } from 'class-transformer';
import { QuizTop } from '../../../../enums/quiz-top.enum';
import { SortDirection } from '../../../../enums/sort-direction.enum';

export class PlayerTopQueryDto extends QueryDto {
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      value = [value.split(' ')];

      if (
        Object.values(QuizTop).includes(value[0][0]) &&
        Object.values(SortDirection).includes(value[0][1].toUpperCase())
      ) {
        value[0][1] = value[0][1].toUpperCase();
        return value;
      }

      return [
        [QuizTop.AverageScores, 'DESC'],
        [QuizTop.SumScore, 'DESC'],
      ];
    } else {
      const mappedParams = value.map((el) => {
        el = el.split(' ');
        el[1] = el[1].toUpperCase();
        return el;
      });

      const isValid = (el) =>
        Object.values(QuizTop).includes(el[0]) &&
        Object.values(SortDirection).includes(el[1].toUpperCase());

      const validationCheck = mappedParams.every(isValid);

      if (validationCheck) {
        return mappedParams;
      }

      return [
        [QuizTop.AverageScores, 'DESC'],
        [QuizTop.SumScore, 'DESC'],
      ];
    }
  })
  sort: Array<[string, 'ASC' | 'DESC']> = [
    [QuizTop.AverageScores, 'DESC'],
    [QuizTop.SumScore, 'DESC'],
  ];
}
