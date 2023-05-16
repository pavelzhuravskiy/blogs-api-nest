import { IsOptional } from 'class-validator';

export class QueryDto {
  @IsOptional()
  sortBy = 'createdAt';
  @IsOptional()
  sortDirection: 'desc' | 'asc' = 'desc';
  @IsOptional()
  pageNumber: number = 1;
  @IsOptional()
  pageSize: number = 10;
}
