export class QueryDto {
  sortBy = 'createdAt';
  sortDirection: 'desc' | 'asc' = 'desc';
  pageNumber: number = 1;
  pageSize: number = 10;
}
