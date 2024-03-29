import { SuperAgentTest } from 'supertest';
import { INestApplication } from '@nestjs/common';
import {
  blog01Name,
  blogDescription,
  bloggerBlogsURI,
  bloggerMainImageURI,
  bloggerWallpaperImageURI,
  blogWebsite,
} from '../utils/constants/blogs.constants';
import {
  saUsersURI,
  user01Email,
  user01Login,
  user02Email,
  user02Login,
  userPassword,
} from '../utils/constants/users.constants';
import {
  basicAuthLogin,
  basicAuthPassword,
  publicLoginUri,
} from '../utils/constants/auth.constants';
import { randomUUID } from 'crypto';
import { getAppAndClearDb } from '../utils/functions/get-app';
import * as path from 'path';
import {
  uploadedWallpaperAndMainImagesObject,
  uploadedWallpaperObject,
} from '../utils/objects/blogs.objects';
import {
  postContent,
  postShortDescription,
  postTitle,
  publicPostsURI,
} from '../utils/constants/posts.constants';

describe('Blogger blogs and posts images testing', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;

  beforeAll(async () => {
    const data = await getAppAndClearDb();
    app = data.app;
    agent = data.agent;
  });

  let blogId;
  let postId;

  let aTokenUser01;
  let aTokenUser02;

  describe('Users creation and authentication', () => {
    it(`should create two users`, async () => {
      await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user01Login,
          password: userPassword,
          email: user01Email,
        })
        .expect(201);

      return agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user02Login,
          password: userPassword,
          email: user02Email,
        })
        .expect(201);
    });
    it(`should log in user 01`, async () => {
      const response = await agent
        .post(publicLoginUri)
        .send({
          loginOrEmail: user01Login,
          password: userPassword,
        })
        .expect(200);
      aTokenUser01 = response.body.accessToken;
    });
    it(`should log in user 02`, async () => {
      const response = await agent
        .post(publicLoginUri)
        .send({
          loginOrEmail: user02Login,
          password: userPassword,
        })
        .expect(200);
      aTokenUser02 = response.body.accessToken;
    });
  });
  describe('Add wallpaper image for blog', () => {
    it(`should create new blog`, async () => {
      await agent
        .post(bloggerBlogsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          name: blog01Name,
          description: blogDescription,
          websiteUrl: blogWebsite,
        })
        .expect(201);

      const blogs = await agent
        .get(bloggerBlogsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(200);

      blogId = blogs.body.items[0].id;
    });

    // Validation errors [400]
    it(`should return 400 when trying to add wallpaper image with incorrect size`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'wallpaper',
        'wallpaper_incorrect_size.jpg',
      );
      return agent
        .post(bloggerBlogsURI + blogId + bloggerWallpaperImageURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .attach('file', filePath)
        .expect(400);
    });
    it(`should return 400 when trying to add wallpaper image with incorrect width`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'wallpaper',
        'wallpaper_incorrect_width.jpg',
      );
      return agent
        .post(bloggerBlogsURI + blogId + bloggerWallpaperImageURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .attach('file', filePath)
        .expect(400);
    });
    it(`should return 400 when trying to add wallpaper image with incorrect height`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'wallpaper',
        'wallpaper_incorrect_height.jpg',
      );
      return agent
        .post(bloggerBlogsURI + blogId + bloggerWallpaperImageURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .attach('file', filePath)
        .expect(400);
    });
    it(`should return 400 when trying to add wallpaper image with incorrect format`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'wallpaper',
        'wallpaper_incorrect_format.txt',
      );
      return agent
        .post(bloggerBlogsURI + blogId + bloggerWallpaperImageURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .attach('file', filePath)
        .expect(400);
    });
    it(`should return 400 when trying to add wallpaper image with unsupported image format`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'wallpaper',
        'wallpaper_unsupported_image_format.tif',
      );
      return agent
        .post(bloggerBlogsURI + blogId + bloggerWallpaperImageURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .attach('file', filePath)
        .expect(400);
    });

    // Auth errors [401]
    it(`should return 401 when trying to add wallpaper image with incorrect access token`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'wallpaper',
        'wallpaper_1028x312_63kb.jpg',
      );
      return agent
        .post(bloggerBlogsURI + blogId + bloggerWallpaperImageURI)
        .auth(randomUUID(), { type: 'bearer' })
        .attach('file', filePath)
        .expect(401);
    });

    // Forbidden errors [403]
    it(`should return 403 when trying to add wallpaper image for blog that belongs to another user`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'wallpaper',
        'wallpaper_1028x312_63kb.jpg',
      );
      return agent
        .post(bloggerBlogsURI + blogId + bloggerWallpaperImageURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .attach('file', filePath)
        .expect(403);
    });

    // Success
    it(`should add wallpaper image (jpg)`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'wallpaper',
        'wallpaper_1028x312_63kb.jpg',
      );
      const blogs = await agent
        .post(bloggerBlogsURI + blogId + bloggerWallpaperImageURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .attach('file', filePath)
        .expect(201);

      expect(blogs.body).toEqual(uploadedWallpaperObject);
    });
    it(`should replace wallpaper image (jpeg)`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'wallpaper',
        'wallpaper_1028x312_63kb.jpeg',
      );
      return agent
        .post(bloggerBlogsURI + blogId + bloggerWallpaperImageURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .attach('file', filePath)
        .expect(201);
    });
  });
  describe('Add main images for blog', () => {
    // Validation errors [400]
    it(`should return 400 when trying to add main image with incorrect size`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'main',
        'main_incorrect_size.jpg',
      );
      return agent
        .post(bloggerBlogsURI + blogId + bloggerMainImageURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .attach('file', filePath)
        .expect(400);
    });
    it(`should return 400 when trying to add main image with incorrect width`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'main',
        'main_incorrect_width.jpg',
      );
      return agent
        .post(bloggerBlogsURI + blogId + bloggerMainImageURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .attach('file', filePath)
        .expect(400);
    });
    it(`should return 400 when trying to add main image with incorrect height`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'main',
        'main_incorrect_height.jpg',
      );
      return agent
        .post(bloggerBlogsURI + blogId + bloggerMainImageURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .attach('file', filePath)
        .expect(400);
    });
    it(`should return 400 when trying to add main image with incorrect format`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'main',
        'main_incorrect_format.txt',
      );
      return agent
        .post(bloggerBlogsURI + blogId + bloggerMainImageURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .attach('file', filePath)
        .expect(400);
    });
    it(`should return 400 when trying to add main image with unsupported image format`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'main',
        'main_unsupported_image_format.tif',
      );
      return agent
        .post(bloggerBlogsURI + blogId + bloggerMainImageURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .attach('file', filePath)
        .expect(400);
    });

    // Auth errors [401]
    it(`should return 401 when trying to add main image with incorrect access token`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'main',
        'main_156x156_10kb.jpg',
      );
      return agent
        .post(bloggerBlogsURI + blogId + bloggerMainImageURI)
        .auth(randomUUID(), { type: 'bearer' })
        .attach('file', filePath)
        .expect(401);
    });

    // Forbidden errors [403]
    it(`should return 403 when trying to add main image for blog that belongs to another user`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'main',
        'main_156x156_10kb.jpg',
      );
      return agent
        .post(bloggerBlogsURI + blogId + bloggerMainImageURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .attach('file', filePath)
        .expect(403);
    });

    // Success
    it(`should add main image (jpg)`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'main',
        'main_156x156_10kb.jpg',
      );
      return agent
        .post(bloggerBlogsURI + blogId + bloggerMainImageURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .attach('file', filePath)
        .expect(201);
    });
    it(`should add main image (jpeg)`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'main',
        'main_156x156_10kb.jpeg',
      );
      return agent
        .post(bloggerBlogsURI + blogId + bloggerMainImageURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .attach('file', filePath)
        .expect(201);
    });
    it(`should add main image (png)`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'main',
        'main_156x156_10kb.png',
      );
      const blogs = await agent
        .post(bloggerBlogsURI + blogId + bloggerMainImageURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .attach('file', filePath)
        .expect(201);

      expect(blogs.body).toEqual(uploadedWallpaperAndMainImagesObject);

      return blogs;
    });
  });
  describe('Add main images for post', () => {
    it(`should create new post`, async () => {
      const response = await agent
        .post(bloggerBlogsURI + blogId + publicPostsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          title: postTitle,
          shortDescription: postShortDescription,
          content: postContent,
        })
        .expect(201);

      postId = response.body.id;
    });

    // Validation errors [400]
    it(`should return 400 when trying to add main image with incorrect size`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'post',
        'main',
        'main_incorrect_size.png',
      );

      return agent
        .post(
          bloggerBlogsURI +
            blogId +
            publicPostsURI +
            postId +
            bloggerMainImageURI,
        )
        .auth(aTokenUser01, { type: 'bearer' })
        .attach('file', filePath)
        .expect(400);
    });
    it(`should return 400 when trying to add main image with incorrect width`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'main',
        'main_incorrect_width.jpg',
      );
      return agent
        .post(
          bloggerBlogsURI +
            blogId +
            publicPostsURI +
            postId +
            bloggerMainImageURI,
        )
        .auth(aTokenUser01, { type: 'bearer' })
        .attach('file', filePath)
        .expect(400);
    });
    it(`should return 400 when trying to add main image with incorrect height`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'main',
        'main_incorrect_height.jpg',
      );
      return agent
        .post(
          bloggerBlogsURI +
            blogId +
            publicPostsURI +
            postId +
            bloggerMainImageURI,
        )
        .auth(aTokenUser01, { type: 'bearer' })
        .attach('file', filePath)
        .expect(400);
    });
    it(`should return 400 when trying to add main image with incorrect format`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'main',
        'main_incorrect_format.txt',
      );
      return agent
        .post(
          bloggerBlogsURI +
            blogId +
            publicPostsURI +
            postId +
            bloggerMainImageURI,
        )
        .auth(aTokenUser01, { type: 'bearer' })
        .attach('file', filePath)
        .expect(400);
    });
    it(`should return 400 when trying to add main image with unsupported image format`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'main',
        'main_unsupported_image_format.tif',
      );
      return agent
        .post(
          bloggerBlogsURI +
            blogId +
            publicPostsURI +
            postId +
            bloggerMainImageURI,
        )
        .auth(aTokenUser01, { type: 'bearer' })
        .attach('file', filePath)
        .expect(400);
    });

    // Auth errors [401]
    it(`should return 401 when trying to add main image with incorrect access token`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'post',
        'main',
        'main_940x432_79kb.jpg',
      );
      return agent
        .post(
          bloggerBlogsURI +
            blogId +
            publicPostsURI +
            postId +
            bloggerMainImageURI,
        )
        .auth(randomUUID(), { type: 'bearer' })
        .attach('file', filePath)
        .expect(401);
    });

    // Forbidden errors [403]
    it(`should return 403 when trying to add main image for blog that belongs to another user`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'post',
        'main',
        'main_940x432_79kb.jpg',
      );
      return agent
        .post(
          bloggerBlogsURI +
            blogId +
            publicPostsURI +
            postId +
            bloggerMainImageURI,
        )
        .auth(aTokenUser02, { type: 'bearer' })
        .attach('file', filePath)
        .expect(403);
    });

    // Success
    it(`should add main image (jpg)`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'post',
        'main',
        'main_940x432_79kb.jpg',
      );
      return agent
        .post(
          bloggerBlogsURI +
            blogId +
            publicPostsURI +
            postId +
            bloggerMainImageURI,
        )
        .auth(aTokenUser01, { type: 'bearer' })
        .attach('file', filePath);
      // .expect(201);
    });
    it(`should add main image (jpeg)`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'post',
        'main',
        'main_940x432_79kb.jpeg',
      );
      return agent
        .post(
          bloggerBlogsURI +
            blogId +
            publicPostsURI +
            postId +
            bloggerMainImageURI,
        )
        .auth(aTokenUser01, { type: 'bearer' })
        .attach('file', filePath)
        .expect(201);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
