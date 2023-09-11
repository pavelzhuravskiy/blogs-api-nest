import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';
import { getAppAndClearDb } from '../utils/functions/get-app';
import {
  saUsersURI,
  user01Email,
  user01Login,
  user02Email,
  user02Login,
  user03Email,
  user03Login,
  userPassword,
} from '../utils/constants/users.constants';
import {
  basicAuthLogin,
  basicAuthPassword,
  publicLoginUri,
} from '../utils/constants/auth.constants';
import { integrationsTelegramBotAuthLinkURI } from '../utils/constants/integrations.constants';
import {
  blog01Name,
  blogDescription,
  bloggerBlogsURI,
  blogSubscriptionURI,
  blogWebsite,
  publicBlogsURI,
} from '../utils/constants/blogs.constants';
import { createdBlogObject } from '../utils/objects/blogs.objects';
import {
  postContent,
  postShortDescription,
  postTitle,
  publicPostsURI,
} from '../utils/constants/posts.constants';
import { mockTelegramIdURI } from '../utils/constants/testing.constants';

describe('Telegram bot testing', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;

  beforeAll(async () => {
    const data = await getAppAndClearDb();
    app = data.app;
    agent = data.agent;
  });

  let aTokenUser01;
  let aTokenUser02;
  let aTokenUser03;
  let blogId;

  describe('Users creation and authentication', () => {
    it(`should create user 01`, async () => {
      return agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user01Login,
          password: userPassword,
          email: user01Email,
        })
        .expect(201);
    });
    it(`should create user 02`, async () => {
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
    it(`should create user 03`, async () => {
      return agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user03Login,
          password: userPassword,
          email: user03Email,
        })
        .expect(201);
    });
    it(`should log in user 01`, async () => {
      const [response] = await Promise.all([
        agent
          .post(publicLoginUri)
          .send({
            loginOrEmail: user01Login,
            password: userPassword,
          })
          .expect(200),
      ]);
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
    it(`should log in user 03`, async () => {
      const response = await agent
        .post(publicLoginUri)
        .send({
          loginOrEmail: user03Login,
          password: userPassword,
        })
        .expect(200);
      aTokenUser03 = response.body.accessToken;
    });
  });
  describe('Blog subscribe', () => {
    it(`should create new blog`, async () => {
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

      expect(blog.body).toEqual(createdBlogObject);
    });
    it(`should subscribe user 01 to blog`, async () => {
      await agent
        .post(publicBlogsURI + blogId + blogSubscriptionURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(204);
    });
    it(`should subscribe user 02 to blog`, async () => {
      await agent
        .post(publicBlogsURI + blogId + blogSubscriptionURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .expect(204);
    });
    it(`should subscribe user 03 to blog`, async () => {
      await agent
        .post(publicBlogsURI + blogId + blogSubscriptionURI)
        .auth(aTokenUser03, { type: 'bearer' })
        .expect(204);
    });
  });
  describe('Telegram bot authentication link', () => {
    it(`should return telegram bot authentication link for user 01`, async () => {
      const response = await agent
        .get(integrationsTelegramBotAuthLinkURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(200);

      expect(response.body).toEqual({
        link: expect.any(String),
      });

      return response;
    });
    it(`should return telegram bot authentication link for user 02`, async () => {
      const response = await agent
        .get(integrationsTelegramBotAuthLinkURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .expect(200);

      expect(response.body).toEqual({
        link: expect.any(String),
      });

      return response;
    });
    it(`should return telegram bot authentication link for user 03`, async () => {
      const response = await agent
        .get(integrationsTelegramBotAuthLinkURI)
        .auth(aTokenUser03, { type: 'bearer' })
        .expect(200);

      expect(response.body).toEqual({
        link: expect.any(String),
      });

      return response;
    });
  });

  describe('Telegram id for user 01 and user 02', () => {
    it(`should set telegram id for two users`, async () => {
      return agent
        .post(mockTelegramIdURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(201);
    });
  });
  describe('Create post', () => {
    // Success
    it(`should create new post`, async () => {
      await agent
        .post(bloggerBlogsURI + blogId + publicPostsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          title: postTitle,
          shortDescription: postShortDescription,
          content: postContent,
        })
        .expect(201);

      // postId = posts.body.items[0].id;
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
