import { SuperAgentTest } from 'supertest';
import { INestApplication } from '@nestjs/common';
import {
  blog01Name,
  blogDescription,
  bloggerBlogMainImageURI,
  bloggerBlogsURI,
  blogUpdatedDescription,
  blogUpdatedName,
  blogUpdatedWebsite,
  blogWebsite,
} from '../utils/constants/blogs.constants';
import { exceptionObject } from '../utils/objects/common.objects';
import { nameField } from '../utils/constants/exceptions.constants';
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
  describe('Add main image for blog', () => {
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
    it.skip(`should return 400 when trying to add main image with incorrect dimensions`, async () => {
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
    it.skip(`should return 400 when trying to add main image with incorrect size`, async () => {
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

    // Auth errors [401]
    it.skip(`should return 401 when trying to add main image with incorrect access token`, async () => {
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

    // Forbidden errors [403]
    it.skip(`should return 403 when trying to add main image of another user's blog`, async () => {
      await agent
        .put(bloggerBlogsURI + blogId)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          name: blogUpdatedName,
          description: blogUpdatedDescription,
          websiteUrl: blogUpdatedWebsite,
        })
        .expect(403);
    });

    // Success
    it(`should add main image`, async () => {
      const filePath = path.join(__dirname, 'img', 'main_156x156_10kb.jpg');
      const response = await agent
        .post(bloggerBlogsURI + blogId + bloggerBlogMainImageURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .attach('file', filePath);

      console.log(response.body);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
