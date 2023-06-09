import { user01Email, user01Login } from '../constants/users.constants';

export const userObject = {
  id: expect.any(String),
  login: user01Login,
  email: user01Email,
  createdAt: expect.any(String),
  banInfo: {
    isBanned: false,
    banDate: null,
    banReason: null,
  },
};

export const userBannedByBloggerObject = {
  id: expect.any(String),
  login: user01Login,
  banInfo: {
    isBanned: true,
    banDate: expect.any(String),
    banReason: expect.any(String),
  },
};

export const userBannedByBloggerObjectWithBlogId = {
  id: expect.any(String),
  login: user01Login,
  banInfo: {
    isBanned: true,
    banDate: expect.any(Date),
    banReason: expect.any(String),
    blogId: expect.any(String),
  },
};
