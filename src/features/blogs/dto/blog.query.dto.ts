import { QueryDto } from '../../_shared/dto/query.dto';

export class BlogQueryDto extends QueryDto {
  searchNameTerm: string;
}
