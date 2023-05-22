import { user01Email, user01Login } from '../constants/users.constants';

export const userObject = {
  id: expect.any(String),
  login: user01Login,
  email: user01Email,
  createdAt: expect.any(String),
};
