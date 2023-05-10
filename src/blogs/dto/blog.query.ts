import { CommonQuery } from '../../common/dto/common.query';
import { IsOptional } from 'class-validator';

export class BlogQuery extends CommonQuery {
  @IsOptional()
  searchNameTerm: string;
}
