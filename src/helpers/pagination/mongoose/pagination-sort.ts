export const pSort = (sortBy: string, sortDirection: any) => {
  const result = {
    [sortBy]: sortDirection,
  };

  if (sortDirection === 'asc') {
    result[sortBy] = 'asc';
  }

  return result;
};
