import { SuperAgentTest } from 'supertest';
import { INestApplication } from '@nestjs/common';
import {
  banURI,
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
import {
  blog01Name,
  blogBindURI,
  blogDescription,
  bloggerBlogsURI,
  blogWebsite,
  publicBlogsURI,
  saBlogsURI,
} from '../utils/constants/blogs.constants';
import { exceptionObject } from '../utils/objects/common.objects';
import {
  blogIDField,
  userIDField,
} from '../../src/exceptions/exception.constants';
import { randomUUID } from 'crypto';
import {
  createdBlogObject,
  saBannedBlogObject,
  saUnbannedBlogObject,
} from '../utils/objects/blogs.objects';
import { isBannedField } from '../utils/constants/exceptions.constants';
import {
  postContent,
  postShortDescription,
  postTitle,
  publicPostsURI,
} from '../utils/constants/posts.constants';
import { createdPostObject } from '../utils/objects/posts.objects';
import { getAppAndClearDb } from '../utils/functions/get-app';

describe('Super admin blogs testing', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;

  beforeAll(async () => {
    const data = await getAppAndClearDb();
    app = data.app;
    agent = data.agent;
  });

  let aTokenUser01;
  let aTokenUser02;

  let user01Id;
  let user02Id;

  let blogId;

  let post01Id;
  let post02Id;

  describe('Users create and authenticate', () => {
    it(`should create two users`, async () => {
      const user01 = await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user01Login,
          password: userPassword,
          email: user01Email,
        })
        .expect(201);

      user01Id = user01.body.id;

      const user02 = await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user02Login,
          password: userPassword,
          email: user02Email,
        })
        .expect(201);

      user02Id = user02.body.id;
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
  describe.skip('Bind blog', () => {
    it(`should create new blog by user 01`, async () => {
      const blog = await agent
        .post(bloggerBlogsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          name: blog01Name,
          description: blogDescription,
          websiteUrl: blogWebsite,
        })
        .expect(201);

      blogId = blog.body.id;
    });

    // Validation errors [400]
    it(`should return 400 when trying to bind nonexistent blog`, async () => {
      const response = await agent
        .put(saBlogsURI + randomUUID() + blogBindURI + user01Id)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(400);

      expect(response.body).toEqual(exceptionObject(blogIDField));
    });
    it(`should return 400 when trying to bind blog to nonexistent user`, async () => {
      const response = await agent
        .put(saBlogsURI + blogId + blogBindURI + randomUUID())
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(400);

      expect(response.body).toEqual(exceptionObject(userIDField));
    });
    it(`should return 400 when trying to bind blog that is already bound`, async () => {
      const response = await agent
        .put(saBlogsURI + blogId + blogBindURI + user02Id)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(400);

      expect(response.body).toEqual(exceptionObject(blogIDField));
    });

    // Auth errors [401]
    it(`should return 401 when trying to bind blog with incorrect credentials`, async () => {
      await agent
        .put(saBlogsURI + blogId + blogBindURI + user02Id)
        .auth(basicAuthLogin, randomUUID())
        .expect(401);
    });

    // Success
    it(`should delete user 01`, async () => {
      return agent
        .delete(saUsersURI + user01Id)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(204);
    });
    it(`should bind blog to user 02 and get all blogs`, async () => {
      await agent
        .put(saBlogsURI + blogId + blogBindURI + user02Id)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(204);

      const blogs = await agent
        .get(saBlogsURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(200);

      expect(blogs.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [saUnbannedBlogObject],
      });
      expect(blogs.body.items[0].blogOwnerInfo.userId).toBe(user02Id);
      expect(blogs.body.items[0].blogOwnerInfo.userLogin).toBe(user02Login);
    });
  });
  describe('Ban blog', () => {
    it(`should create new blog by user 01`, async () => {
      const blog = await agent
        .post(bloggerBlogsURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          name: blog01Name,
          description: blogDescription,
          websiteUrl: blogWebsite,
        })
        .expect(201);

      blogId = blog.body.id;
    });
    it(`should create two posts`, async () => {
      const post01 = await agent
        .post(bloggerBlogsURI + blogId + publicPostsURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          title: postTitle,
          shortDescription: postShortDescription,
          content: postContent,
        })
        .expect(201);

      post01Id = post01.body.id;

      const post02 = await agent
        .post(bloggerBlogsURI + blogId + publicPostsURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          title: postTitle,
          shortDescription: postShortDescription,
          content: postContent,
        })
        .expect(201);

      post02Id = post02.body.id;
    });

    // Validation errors [400]
    it(`should return 400 when trying to ban blog without isBanned field`, async () => {
      const response = await agent
        .put(saBlogsURI + blogId + banURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(400);

      expect(response.body).toEqual(exceptionObject(isBannedField));
    });
    it(`should return 400 when trying to ban blog with incorrect isBanned type`, async () => {
      const response = await agent
        .put(saBlogsURI + blogId + banURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          isBanned: 123,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(isBannedField));
    });

    // Auth errors [401]
    it(`should return 401 when trying to ban blog with incorrect credentials`, async () => {
      await agent
        .put(saBlogsURI + blogId + banURI)
        .auth(randomUUID(), basicAuthPassword)
        .send({
          isBanned: true,
        })
        .expect(401);
    });

    // Success
    it(`should return created blogs`, async () => {
      const blogs = await agent.get(publicBlogsURI).expect(200);

      expect(blogs.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [createdBlogObject],
      });
    });
    it(`should return created posts`, async () => {
      const posts = await agent.get(publicPostsURI).expect(200);

      expect(posts.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [createdPostObject, createdPostObject],
      });
    });
    it(`should return created posts for blog`, async () => {
      const posts = await agent
        .get(publicBlogsURI + blogId + publicPostsURI)
        .expect(200);

      expect(posts.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [createdPostObject, createdPostObject],
      });
    });
    it(`should return created blog by ID`, async () => {
      const blog = await agent.get(publicBlogsURI + blogId).expect(200);
      expect(blog.body).toEqual(createdBlogObject);
    });
    it(`should return created post by ID`, async () => {
      const post01 = await agent.get(publicPostsURI + post01Id).expect(200);
      const post02 = await agent.get(publicPostsURI + post02Id).expect(200);
      expect(post01.body).toEqual(createdPostObject);
      expect(post02.body).toEqual(createdPostObject);
    });

    it(`should ban blog`, async () => {
      return agent
        .put(saBlogsURI + blogId + banURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          isBanned: true,
        })
        .expect(204);
    });

    it(`should return created blogs for blogger`, async () => {
      const blogs = await agent
        .get(bloggerBlogsURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .expect(200);

      expect(blogs.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [createdBlogObject],
      });
    });
    it(`should return created blogs for super admin`, async () => {
      const blogs = await agent
        .get(saBlogsURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(200);

      expect(blogs.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [saBannedBlogObject],
      });
    });
    it(`should NOT return created blogs for public user`, async () => {
      const posts = await agent.get(publicBlogsURI).expect(200);

      expect(posts.body).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });
    it(`should NOT return created blog by ID`, async () => {
      return agent.get(publicBlogsURI + blogId).expect(404);
    });
    it(`should NOT return created posts after blog ban`, async () => {
      const posts = await agent.get(publicPostsURI).expect(200);

      expect(posts.body).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });
    it(`should NOT return created posts for blog after blog ban`, async () => {
      return agent.get(publicBlogsURI + blogId + publicPostsURI).expect(404);
    });
    it(`should NOT return created post by ID after blog ban`, async () => {
      await agent.get(publicPostsURI + post01Id).expect(404);
      await agent.get(publicPostsURI + post02Id).expect(404);
    });
  });
  describe('Unban blog', () => {
    // Success
    it(`should unban blog`, async () => {
      return agent
        .put(saBlogsURI + blogId + banURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          isBanned: false,
        })
        .expect(204);
    });

    it(`should return created blogs for public user`, async () => {
      const posts = await agent.get(publicBlogsURI).expect(200);

      expect(posts.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [createdBlogObject],
      });
    });
    it(`should return created blog by ID`, async () => {
      const blog = await agent.get(publicBlogsURI + blogId).expect(200);
      expect(blog.body).toEqual(createdBlogObject);
    });
    it(`should return created posts`, async () => {
      const posts = await agent.get(publicPostsURI).expect(200);

      expect(posts.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [createdPostObject, createdPostObject],
      });
    });
    it(`should return created posts for blog`, async () => {
      const posts = await agent
        .get(publicBlogsURI + blogId + publicPostsURI)
        .expect(200);

      expect(posts.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [createdPostObject, createdPostObject],
      });
    });
    it(`should return created post by ID`, async () => {
      const post01 = await agent.get(publicPostsURI + post01Id).expect(200);
      const post02 = await agent.get(publicPostsURI + post02Id).expect(200);
      expect(post01.body).toEqual(createdPostObject);
      expect(post02.body).toEqual(createdPostObject);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
