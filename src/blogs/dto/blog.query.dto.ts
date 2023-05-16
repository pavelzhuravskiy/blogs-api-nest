import { QueryDto } from '../../api/dto/query.dto';
import { IsOptional } from 'class-validator';

export class BlogQueryDto extends QueryDto {
  @IsOptional()
  searchNameTerm: string;
}
