import { SortOrder } from 'mongoose';

export const pSort = (sortBy: string, sortDirection: SortOrder) => {
  const result = {
    [sortBy]: sortDirection,
  };

  if (sortDirection === 'asc') {
    result[sortBy] = 'asc';
  }

  return result;
};
