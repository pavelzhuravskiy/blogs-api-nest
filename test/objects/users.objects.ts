import { userEmail, userLogin } from '../constants/users.constants';

export const userObject = {
  id: expect.any(String),
  login: userLogin,
  email: userEmail,
  createdAt: expect.any(String),
};
