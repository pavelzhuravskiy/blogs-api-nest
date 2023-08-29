import {
  blog01Name,
  blog02Name,
  blogDescription,
  blogUpdatedDescription,
  blogUpdatedName,
  blogUpdatedWebsite,
  blogWebsite,
} from '../constants/blogs.constants';

export const createdBlogObject = {
  id: expect.any(String),
  name: expect.any(String),
  description: blogDescription,
  websiteUrl: blogWebsite,
  createdAt: expect.any(String),
  isMembership: false,
  images: {
    wallpaper: null,
    main: [],
  },
};

export const blog01Object = {
  id: expect.any(String),
  name: blog01Name,
  description: blogDescription,
  websiteUrl: blogWebsite,
  createdAt: expect.any(String),
  isMembership: false,
  images: {
    wallpaper: {
      url: expect.any(String),
      width: expect.any(Number),
      height: expect.any(Number),
      fileSize: expect.any(Number),
    },
    main: [
      {
        url: expect.any(String),
        width: expect.any(Number),
        height: expect.any(Number),
        fileSize: expect.any(Number),
      },
      {
        url: expect.any(String),
        width: expect.any(Number),
        height: expect.any(Number),
        fileSize: expect.any(Number),
      },
      {
        url: expect.any(String),
        width: expect.any(Number),
        height: expect.any(Number),
        fileSize: expect.any(Number),
      },
    ],
  },
};

export const blog02Object = {
  id: expect.any(String),
  name: blog02Name,
  description: blogDescription,
  websiteUrl: blogWebsite,
  createdAt: expect.any(String),
  isMembership: false,
  images: {
    wallpaper: {
      url: expect.any(String),
      width: expect.any(Number),
      height: expect.any(Number),
      fileSize: expect.any(Number),
    },
    main: [
      {
        url: expect.any(String),
        width: expect.any(Number),
        height: expect.any(Number),
        fileSize: expect.any(Number),
      },
    ],
  },
};

export const updatedBlogObject = {
  id: expect.any(String),
  name: blogUpdatedName,
  description: blogUpdatedDescription,
  websiteUrl: blogUpdatedWebsite,
  createdAt: expect.any(String),
  isMembership: false,
  images: {
    wallpaper: {
      url: expect.any(String),
      width: expect.any(Number),
      height: expect.any(Number),
      fileSize: expect.any(Number),
    },
    main: [
      {
        url: expect.any(String),
        width: expect.any(Number),
        height: expect.any(Number),
        fileSize: expect.any(Number),
      },
      {
        url: expect.any(String),
        width: expect.any(Number),
        height: expect.any(Number),
        fileSize: expect.any(Number),
      },
      {
        url: expect.any(String),
        width: expect.any(Number),
        height: expect.any(Number),
        fileSize: expect.any(Number),
      },
    ],
  },
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

export const uploadedWallpaperObject = {
  wallpaper: {
    url: expect.any(String),
    width: expect.any(Number),
    height: expect.any(Number),
    fileSize: expect.any(Number),
  },
  main: [],
};

export const uploadedWallpaperAndMainImagesObject = {
  wallpaper: {
    url: expect.any(String),
    width: expect.any(Number),
    height: expect.any(Number),
    fileSize: expect.any(Number),
  },
  main: [
    {
      url: expect.any(String),
      width: expect.any(Number),
      height: expect.any(Number),
      fileSize: expect.any(Number),
    },
    {
      url: expect.any(String),
      width: expect.any(Number),
      height: expect.any(Number),
      fileSize: expect.any(Number),
    },
    {
      url: expect.any(String),
      width: expect.any(Number),
      height: expect.any(Number),
      fileSize: expect.any(Number),
    },
  ],
};
