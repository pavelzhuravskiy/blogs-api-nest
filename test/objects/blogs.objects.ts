import {
  blogDescription,
  blogName,
  blogUpdatedDescription,
  blogUpdatedName,
  blogUpdatedWebsite,
  blogWebsite,
} from '../constants/blogs.constants';

export const publicBlogObject = {
  id: expect.any(String),
  name: blogName,
  description: blogDescription,
  websiteUrl: blogWebsite,
  createdAt: expect.any(String),
  isMembership: false,
};

export const publicUpdatedBlogObject = {
  id: expect.any(String),
  name: blogUpdatedName,
  description: blogUpdatedDescription,
  websiteUrl: blogUpdatedWebsite,
  createdAt: expect.any(String),
  isMembership: false,
};
