import { QueryDto } from '../query.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { BanStatus } from '../../../enums/ban-status.enum';

export class UserQueryDto extends QueryDto {
  @IsOptional()
  @IsEnum(BanStatus)
  banStatus: string;
  searchLoginTerm: string;
  searchEmailTerm: string;
}
