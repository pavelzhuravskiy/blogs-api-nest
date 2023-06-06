import { FilterQuery, SortOrder } from 'mongoose';

export const pFind = (
  model: any,
  pageNumber: number,
  pageSize: number,
  filterObject: FilterQuery<any>,
  sortingObject: { [key: string]: SortOrder },
) => {
  return model
    .find(filterObject)
    .sort(sortingObject)
    .skip(pageNumber > 0 ? (pageNumber - 1) * pageSize : 0)
    .limit(pageSize > 0 ? pageSize : 0)
    .lean();
};
