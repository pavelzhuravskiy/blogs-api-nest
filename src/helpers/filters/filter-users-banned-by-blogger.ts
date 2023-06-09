export const filterUsersBannedByBlogger = (login: string) => {
  let loginFilter = '%';

  if (login) {
    loginFilter = `%${login}%`;
  }

  return loginFilter;
};
