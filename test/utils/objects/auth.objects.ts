import { user01Email, user01Login } from '../constants/users.constants';

export const userProfileObject = {
  email: user01Email,
  login: user01Login,
  userId: expect.any(String),
};

export const deviceObject = {
  ip: expect.any(String),
  title: expect.any(String),
  lastActiveDate: expect.any(String),
  deviceId: expect.any(String),
};
