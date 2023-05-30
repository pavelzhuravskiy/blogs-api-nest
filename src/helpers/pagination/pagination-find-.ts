import { FilterQuery, SortOrder } from 'mongoose';

export const pFind2 = (
  model: any,
  pageNumber: number,
  pageSize: number,
  filterObject: FilterQuery<any>,
  sortingObject: { [key: string]: SortOrder },
) => {
  return model
    .find(filterObject, { _id: 0, bannedUsers: 1 })
    .sort(sortingObject)
    .skip(pageNumber > 0 ? (pageNumber - 1) * pageSize : 0)
    .limit(pageSize > 0 ? pageSize : 0)
    .lean();
};
