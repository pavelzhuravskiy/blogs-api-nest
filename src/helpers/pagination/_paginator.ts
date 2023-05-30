export class Paginator<T> {
  public pagesCount: number;
  public page: number;
  public pageSize: number;
  public totalCount: number;
  public items: T;

  static paginate<T>(data: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    items: T;
  }): Paginator<T> {
    console.log(data.totalCount);
    console.log(data.pageSize);
    return {
      pagesCount: Math.ceil(data.totalCount / data.pageSize),
      page: Number(data.pageNumber),
      pageSize: Number(data.pageSize),
      totalCount: data.totalCount,
      items: data.items,
    };
  }
}
