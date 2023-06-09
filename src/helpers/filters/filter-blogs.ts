import { Role } from '../../enums/role.enum';

export const filterBlogs = (name: string, role?: string) => {
  let nameFilter = '%';
  let banFilter = false;

  if (name) {
    nameFilter = `%${name}%`;
  }

  if (role === Role.SuperAdmin) {
    banFilter = true;
  }

  return {
    nameFilter: nameFilter,
    banFilter: banFilter,
  };
};
