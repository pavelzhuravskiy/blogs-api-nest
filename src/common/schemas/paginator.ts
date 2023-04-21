export class Paginator<T> {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T;

  static getPaginated<T>(dto: {
    page: number;
    pageSize: number;
    items: T;
    totalCount;
  }): Paginator<T> {
    return {
      page: dto.page,
      items: dto.items,
      pageSize: dto.pageSize,
      pagesCount: Math.ceil(dto.totalCount / dto.pageSize),
      totalCount: dto.totalCount,
    };
  }
}
