import { CommonQuery } from '../../common/dto/common.query';
import { IsOptional } from 'class-validator';

export class UserQuery extends CommonQuery {
  @IsOptional()
  searchLoginTerm: string;
  @IsOptional()
  searchEmailTerm: string;
}
