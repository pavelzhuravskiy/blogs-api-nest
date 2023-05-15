import { CommonQueryDto } from '../../../common/dto/common-query.dto';
import { IsOptional } from 'class-validator';

export class BlogQueryDto extends CommonQueryDto {
  @IsOptional()
  searchNameTerm: string;
}
