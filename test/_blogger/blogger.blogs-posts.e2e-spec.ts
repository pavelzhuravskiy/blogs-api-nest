import { SuperAgentTest } from 'supertest';
import { INestApplication } from '@nestjs/common';
import {
  blog01Name,
  blog02Name,
  blogDescription,
  bloggerBlogsURI,
  bloggerMainImageURI,
  bloggerWallpaperImageURI,
  blogSubscriptionURI,
  blogUpdatedDescription,
  blogUpdatedName,
  blogUpdatedWebsite,
  blogWebsite,
  publicBlogsURI,
} from '../utils/constants/blogs.constants';
import {
  longString1013,
  longString109,
  longString17,
  longString39,
  longString508,
} from '../utils/constants/common.constants';
import { exceptionObject } from '../utils/objects/common.objects';
import {
  contentField,
  descriptionField,
  nameField,
  shortDescriptionField,
  titleField,
  urlField,
} from '../utils/constants/exceptions.constants';
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
import {
  blog01Object,
  blog02Object,
  createdBlogObject,
  updatedBlogObject,
} from '../utils/objects/blogs.objects';
import {
  postContent,
  postShortDescription,
  postTitle,
  postUpdatedContent,
  postUpdatedShortDescription,
  postUpdatedTitle,
  publicPostsURI,
} from '../utils/constants/posts.constants';
import {
  createdPostObject,
  updatedPostObject,
} from '../utils/objects/posts.objects';
import { getAppAndClearDb } from '../utils/functions/get-app';
import path from 'path';

describe('Blogger blogs and posts testing', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;

  beforeAll(async () => {
    const data = await getAppAndClearDb();
    app = data.app;
    agent = data.agent;
  });

  let blog01Id;
  let blog02Id;

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

  describe('Create blogs and add images', () => {
    // Validation errors [400]
    it(`should return 400 when trying to create blog without name`, async () => {
      const response = await agent
        .post(bloggerBlogsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          description: blogDescription,
          websiteUrl: blogWebsite,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(nameField));
    });
    it(`should return 400 when trying to create blog with incorrect name type`, async () => {
      const response = await agent
        .post(bloggerBlogsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          name: 123,
          description: blogDescription,
          websiteUrl: blogWebsite,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(nameField));
    });
    it(`should return 400 when trying to create blog with incorrect name length`, async () => {
      const response = await agent
        .post(bloggerBlogsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          name: longString17,
          description: blogDescription,
          websiteUrl: blogWebsite,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(nameField));
    });
    it(`should return 400 when trying to create blog without description`, async () => {
      const response = await agent
        .post(bloggerBlogsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          name: blog01Name,
          websiteUrl: blogWebsite,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(descriptionField));
    });
    it(`should return 400 when trying to create blog with incorrect description type`, async () => {
      const response = await agent
        .post(bloggerBlogsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          name: blog01Name,
          description: 123,
          websiteUrl: blogWebsite,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(descriptionField));
    });
    it(`should return 400 when trying to create blog with incorrect description length`, async () => {
      const response = await agent
        .post(bloggerBlogsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          name: blog01Name,
          description: longString508,
          websiteUrl: blogWebsite,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(descriptionField));
    });
    it(`should return 400 when trying to create blog without URL`, async () => {
      const response = await agent
        .post(bloggerBlogsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          name: blog01Name,
          description: blogDescription,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(urlField));
    });
    it(`should return 400 when trying to create blog with incorrect URL type`, async () => {
      const response = await agent
        .post(bloggerBlogsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          name: blog01Name,
          description: blogDescription,
          websiteUrl: 123,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(urlField));
    });
    it(`should return 400 when trying to create blog with incorrect URL length`, async () => {
      const response = await agent
        .post(bloggerBlogsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          name: blog01Name,
          description: blogDescription,
          websiteUrl: longString109,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(urlField));
    });
    it(`should return 400 when trying to create blog with incorrect URL format`, async () => {
      const response = await agent
        .post(bloggerBlogsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          name: blog01Name,
          description: blogDescription,
          websiteUrl: urlField,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(urlField));
    });

    // Auth errors [401]
    it(`should return 401 when trying to create blog with incorrect access token`, async () => {
      return agent
        .post(bloggerBlogsURI)
        .auth(randomUUID(), { type: 'bearer' })
        .send({
          name: blog01Name,
          description: blogDescription,
          websiteUrl: blogWebsite,
        })
        .expect(401);
    });

    // Success
    it(`should create new blog of user 01`, async () => {
      const blog = await agent
        .post(bloggerBlogsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          name: blog01Name,
          description: blogDescription,
          websiteUrl: blogWebsite,
        })
        .expect(201);

      blog01Id = blog.body.id;

      expect(blog.body).toEqual(createdBlogObject);
    });
    it(`should create new blog of user 02`, async () => {
      const blog = await agent
        .post(bloggerBlogsURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          name: blog02Name,
          description: blogDescription,
          websiteUrl: blogWebsite,
        })
        .expect(201);

      blog02Id = blog.body.id;

      expect(blog.body).toEqual(createdBlogObject);
    });

    it(`should add wallpaper image (jpg) for blog 01`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'wallpaper',
        'wallpaper_1028x312_63kb.jpg',
      );
      return agent
        .post(bloggerBlogsURI + blog01Id + bloggerWallpaperImageURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .attach('file', filePath)
        .expect(201);
    });
    it(`should add main image (jpg) for blog 01`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'main',
        'main_156x156_10kb.jpg',
      );
      return agent
        .post(bloggerBlogsURI + blog01Id + bloggerMainImageURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .attach('file', filePath)
        .expect(201);
    });
    it(`should add main image (jpeg) for blog 01`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'main',
        'main_156x156_10kb.jpeg',
      );
      return agent
        .post(bloggerBlogsURI + blog01Id + bloggerMainImageURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .attach('file', filePath)
        .expect(201);
    });
    it(`should add main image (png) for blog 01`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'main',
        'main_156x156_10kb.png',
      );
      return agent
        .post(bloggerBlogsURI + blog01Id + bloggerMainImageURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .attach('file', filePath)
        .expect(201);
    });

    it(`should add wallpaper image (jpg) for blog 02`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'wallpaper',
        'wallpaper_1028x312_63kb.jpg',
      );
      return agent
        .post(bloggerBlogsURI + blog02Id + bloggerWallpaperImageURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .attach('file', filePath)
        .expect(201);
    });
    it(`should add main image (jpg) for blog 02`, async () => {
      const filePath = path.join(
        __dirname,
        'img',
        'blog',
        'main',
        'main_156x156_10kb.jpg',
      );
      return agent
        .post(bloggerBlogsURI + blog02Id + bloggerMainImageURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .attach('file', filePath)
        .expect(201);
    });
  });
  describe('Blog subscribe', () => {
    // Success
    it(`should subscribe user 01 to blog 01`, async () => {
      await agent
        .post(publicBlogsURI + blog01Id + blogSubscriptionURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(204);
    });
    it(`should subscribe user 02 to blog 02`, async () => {
      await agent
        .post(publicBlogsURI + blog02Id + blogSubscriptionURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .expect(204);
    });
  });
  describe('Find blogs', () => {
    // Auth errors [401]
    it(`should return 401 when trying to get blogs with incorrect access token`, async () => {
      return agent
        .get(bloggerBlogsURI)
        .auth(randomUUID(), { type: 'bearer' })
        .expect(401);
    });

    // Success
    it(`should return blog of user 01 (not user 02)`, async () => {
      const blogs = await agent
        .get(bloggerBlogsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(200);

      expect(blogs.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [blog01Object],
      });
    });
    it(`should return blog of user 02 (not user 01)`, async () => {
      const blogs = await agent
        .get(bloggerBlogsURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .expect(200);

      console.log(blogs.body, 'user 02');

      expect(blogs.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [blog02Object],
      });
    });
  });
  describe('Update blog', () => {
    // Auth errors [401]
    it(`should return 401 when trying to update blog with incorrect access token`, async () => {
      return agent
        .put(bloggerBlogsURI + blog01Id)
        .auth(randomUUID(), { type: 'bearer' })
        .send({
          name: blogUpdatedName,
          description: blogUpdatedDescription,
          websiteUrl: blogUpdatedWebsite,
        })
        .expect(401);
    });

    // Forbidden errors [403]
    it(`should return 403 when trying to update blog of another user`, async () => {
      await agent
        .put(bloggerBlogsURI + blog01Id)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          name: blogUpdatedName,
          description: blogUpdatedDescription,
          websiteUrl: blogUpdatedWebsite,
        })
        .expect(403);
    });

    // Not found errors [404]
    it(`should return 404 when trying to update nonexistent blog`, async () => {
      await agent
        .put(bloggerBlogsURI + randomUUID())
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          name: blogUpdatedName,
          description: blogUpdatedDescription,
          websiteUrl: blogUpdatedWebsite,
        })
        .expect(404);
    });

    // Success
    it(`should update blog by ID`, async () => {
      await agent
        .put(bloggerBlogsURI + blog01Id)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          name: blogUpdatedName,
          description: blogUpdatedDescription,
          websiteUrl: blogUpdatedWebsite,
        })
        .expect(204);

      const check = await agent.get(publicBlogsURI + blog01Id).expect(200);
      expect(check.body).toEqual(updatedBlogObject);
    });
  });
  describe('Delete blog', () => {
    // Auth errors [401]
    it(`should return 401 when trying to delete blog with incorrect access token`, async () => {
      return agent
        .delete(bloggerBlogsURI + blog01Id)
        .auth(randomUUID(), { type: 'bearer' })
        .expect(401);
    });

    // Forbidden errors [403]
    it(`should return 403 when trying to delete blog of another user`, async () => {
      await agent
        .delete(bloggerBlogsURI + blog01Id)
        .auth(aTokenUser02, { type: 'bearer' })
        .expect(403);
    });

    // Not found errors [404]
    it(`should return 404 when trying to delete nonexistent blog`, async () => {
      await agent
        .delete(bloggerBlogsURI + randomUUID())
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(404);
    });

    // Success
    it(`should delete blog by ID`, async () => {
      await agent
        .delete(bloggerBlogsURI + blog02Id)
        .auth(aTokenUser02, { type: 'bearer' })
        .expect(204);

      const blogs = await agent.get(publicBlogsURI).expect(200);
      expect(blogs.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [updatedBlogObject],
      });
    });
  });

  describe('Create post', () => {
    // Validation errors [400]
    it(`should return 400 when trying to create post without title`, async () => {
      const response = await agent
        .post(bloggerBlogsURI + blog01Id + publicPostsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          shortDescription: postShortDescription,
          content: postContent,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(titleField));
    });
    it(`should return 400 when trying to create post with incorrect title type`, async () => {
      const response = await agent
        .post(bloggerBlogsURI + blog01Id + publicPostsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          title: 123,
          shortDescription: postShortDescription,
          content: postContent,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(titleField));
    });
    it(`should return 400 when trying to create post with incorrect title length`, async () => {
      const response = await agent
        .post(bloggerBlogsURI + blog01Id + publicPostsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          title: longString39,
          shortDescription: postShortDescription,
          content: postContent,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(titleField));
    });
    it(`should return 400 when trying to create post without short description`, async () => {
      const response = await agent
        .post(bloggerBlogsURI + blog01Id + publicPostsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          title: postTitle,
          content: postContent,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(shortDescriptionField));
    });
    it(`should return 400 when trying to create post with incorrect short description type`, async () => {
      const response = await agent
        .post(bloggerBlogsURI + blog01Id + publicPostsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          title: postTitle,
          shortDescription: 123,
          content: postContent,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(shortDescriptionField));
    });
    it(`should return 400 when trying to create post with incorrect short description length`, async () => {
      const response = await agent
        .post(bloggerBlogsURI + blog01Id + publicPostsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          title: postTitle,
          shortDescription: longString109,
          content: postContent,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(shortDescriptionField));
    });
    it(`should return 400 when trying to create post without content`, async () => {
      const response = await agent
        .post(bloggerBlogsURI + blog01Id + publicPostsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          title: postTitle,
          shortDescription: postShortDescription,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(contentField));
    });
    it(`should return 400 when trying to create post with incorrect content type`, async () => {
      const response = await agent
        .post(bloggerBlogsURI + blog01Id + publicPostsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          title: postTitle,
          shortDescription: postShortDescription,
          content: 123,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(contentField));
    });
    it(`should return 400 when trying to create post with incorrect content length`, async () => {
      const response = await agent
        .post(bloggerBlogsURI + blog01Id + publicPostsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          title: postTitle,
          shortDescription: postShortDescription,
          content: longString1013,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(contentField));
    });

    // Auth errors [401]
    it(`should return 401 when trying to create post with incorrect access token`, async () => {
      return agent
        .post(bloggerBlogsURI + blog01Id + publicPostsURI)
        .auth(randomUUID(), { type: 'bearer' })
        .send({
          title: postTitle,
          shortDescription: postShortDescription,
          content: postContent,
        })
        .expect(401);
    });

    // Forbidden errors [403]
    it(`should return 403 when trying to create post of another user's blog`, async () => {
      await agent
        .post(bloggerBlogsURI + blog01Id + publicPostsURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          title: postTitle,
          shortDescription: postShortDescription,
          content: postContent,
        })
        .expect(403);
    });

    // Not found errors [404]
    it(`should return 404 when trying to create post of nonexistent blog`, async () => {
      await agent
        .post(bloggerBlogsURI + randomUUID() + publicPostsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          title: postTitle,
          shortDescription: postShortDescription,
          content: postContent,
        })
        .expect(404);
    });

    // Success
    it(`should create new post`, async () => {
      await agent
        .post(bloggerBlogsURI + blog01Id + publicPostsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          title: postTitle,
          shortDescription: postShortDescription,
          content: postContent,
        })
        .expect(201);

      const posts = await agent.get(publicPostsURI).expect(200);

      postId = posts.body.items[0].id;

      expect(posts.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [createdPostObject],
      });
    });
  });
  describe.skip('Update post', () => {
    // Auth errors [401]
    it(`should return 401 when trying to update post with incorrect access token`, async () => {
      return agent
        .put(bloggerBlogsURI + blog01Id + publicPostsURI + postId)
        .auth(randomUUID(), { type: 'bearer' })
        .send({
          title: postUpdatedTitle,
          shortDescription: postUpdatedShortDescription,
          content: postUpdatedContent,
        })
        .expect(401);
    });

    // Forbidden errors [403]
    it(`should return 403 when trying to update post of another user's blog`, async () => {
      return agent
        .put(bloggerBlogsURI + blog01Id + publicPostsURI + postId)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          title: postUpdatedTitle,
          shortDescription: postUpdatedShortDescription,
          content: postUpdatedContent,
        })
        .expect(403);
    });

    // Not found errors [404]
    it(`should return 404 when trying to update post of nonexistent blog`, async () => {
      return agent
        .put(bloggerBlogsURI + randomUUID() + publicPostsURI + postId)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          title: postUpdatedTitle,
          shortDescription: postUpdatedShortDescription,
          content: postUpdatedContent,
        })
        .expect(404);
    });
    it(`should return 404 when trying to update nonexistent post`, async () => {
      return agent
        .put(bloggerBlogsURI + blog01Id + publicPostsURI + randomUUID())
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          title: postUpdatedTitle,
          shortDescription: postUpdatedShortDescription,
          content: postUpdatedContent,
        })
        .expect(404);
    });

    // Success
    it(`should update post by ID`, async () => {
      await agent
        .put(bloggerBlogsURI + blog01Id + publicPostsURI + postId)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          title: postUpdatedTitle,
          shortDescription: postUpdatedShortDescription,
          content: postUpdatedContent,
        })
        .expect(204);

      const check = await agent.get(publicPostsURI + postId).expect(200);
      expect(check.body).toEqual(updatedPostObject);
    });
  });
  describe.skip('Delete post', () => {
    // Auth errors [401]
    it(`should return 401 when trying to delete post with incorrect access token`, async () => {
      return agent
        .delete(bloggerBlogsURI + blog01Id + publicPostsURI + postId)
        .auth(randomUUID(), { type: 'bearer' })
        .expect(401);
    });

    // Forbidden errors [403]
    it(`should return 403 when trying to delete post of another user's blog`, async () => {
      return agent
        .delete(bloggerBlogsURI + blog01Id + publicPostsURI + postId)
        .auth(aTokenUser02, { type: 'bearer' })
        .expect(403);
    });

    // Not found errors [404]
    it(`should return 404 when trying to delete post of nonexistent blog`, async () => {
      return agent
        .delete(bloggerBlogsURI + randomUUID() + publicPostsURI + postId)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(404);
    });
    it(`should return 404 when trying to delete nonexistent post`, async () => {
      return agent
        .delete(bloggerBlogsURI + blog01Id + publicPostsURI + randomUUID())
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(404);
    });

    // Success
    it(`should delete post by ID`, async () => {
      await agent
        .delete(bloggerBlogsURI + blog01Id + publicPostsURI + postId)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(204);

      const posts = await agent.get(publicPostsURI).expect(200);
      expect(posts.body).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
