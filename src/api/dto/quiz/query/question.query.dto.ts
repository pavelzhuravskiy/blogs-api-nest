import { QueryDto } from '../../query.dto';
import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { Question } from '../../../entities/quiz/question.entity';
import { PublishedStatus } from '../../../../enums/published-status.enum';

export class QuestionQueryDto extends QueryDto {
  @Transform(({ value }) => {
    if (Question.checkSortingField(value)) {
      return value;
    } else {
      return 'createdAt';
    }
  })
  sortBy = 'createdAt';

  @IsOptional()
  @Transform(({ value }) => {
    if (value === PublishedStatus.Published) {
      return true;
    }
    if (value === PublishedStatus.NotPublished) {
      return false;
    }
  })
  publishedStatus: boolean | string;

  @IsOptional()
  bodySearchTerm: string;
}
