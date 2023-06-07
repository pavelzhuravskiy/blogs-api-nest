export const filterBlogs = (name: string) => {
  let nameFilter = '%';

  if (name) {
    nameFilter = `%${name}%`;
  }

  return nameFilter;
};
