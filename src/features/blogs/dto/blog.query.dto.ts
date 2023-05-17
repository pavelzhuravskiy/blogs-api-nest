import { QueryDto } from '../../_shared/dto/query.dto';
import { IsOptional } from 'class-validator';

export class BlogQueryDto extends QueryDto {
  @IsOptional()
  searchNameTerm: string;
}
