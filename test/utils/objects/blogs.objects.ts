import {
  blog01Name,
  blog02Name,
  blogDescription,
  blogUpdatedDescription,
  blogUpdatedName,
  blogUpdatedWebsite,
  blogWebsite,
} from '../constants/blogs.constants';

export const blog01Object = {
  id: expect.any(String),
  name: blog01Name,
  description: blogDescription,
  websiteUrl: blogWebsite,
  createdAt: expect.any(String),
  isMembership: false,
};

export const blog02Object = {
  id: expect.any(String),
  name: blog02Name,
  description: blogDescription,
  websiteUrl: blogWebsite,
  createdAt: expect.any(String),
  isMembership: false,
};

export const saUnbannedBlogObject = {
  id: expect.any(String),
  name: blog01Name,
  description: blogDescription,
  websiteUrl: blogWebsite,
  createdAt: expect.any(String),
  isMembership: false,
  blogOwnerInfo: {
    userId: expect.any(String),
    userLogin: expect.any(String),
  },
  banInfo: {
    isBanned: false,
    banDate: null,
  },
};

export const saBannedBlogObject = {
  id: expect.any(String),
  name: blog01Name,
  description: blogDescription,
  websiteUrl: blogWebsite,
  createdAt: expect.any(String),
  isMembership: false,
  blogOwnerInfo: {
    userId: expect.any(String),
    userLogin: expect.any(String),
  },
  banInfo: {
    isBanned: true,
    banDate: expect.any(String),
  },
};

export const updatedBlogObject = {
  id: expect.any(String),
  name: blogUpdatedName,
  description: blogUpdatedDescription,
  websiteUrl: blogUpdatedWebsite,
  createdAt: expect.any(String),
  isMembership: false,
};
