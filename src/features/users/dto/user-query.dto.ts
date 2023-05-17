import { QueryDto } from '../../_shared/dto/query.dto';
import { IsOptional } from 'class-validator';

export class UserQueryDto extends QueryDto {
  @IsOptional()
  searchLoginTerm: string;
  @IsOptional()
  searchEmailTerm: string;
}
