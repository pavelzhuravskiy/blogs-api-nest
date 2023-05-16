import { CommonQueryDto } from '../../../common/dto/common-query.dto';
import { IsOptional } from 'class-validator';

export class UserQueryDto extends CommonQueryDto {
  @IsOptional()
  searchLoginTerm: string;
  @IsOptional()
  searchEmailTerm: string;
}
