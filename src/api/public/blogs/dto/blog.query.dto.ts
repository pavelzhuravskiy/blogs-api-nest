import { QueryDto } from '../../../../common/dto/query.dto';

export class BlogQueryDto extends QueryDto {
  searchNameTerm: string;
}
