import { SuperAgentTest } from 'supertest';
import { INestApplication } from '@nestjs/common';
import {
  blog01Name,
  blogDescription,
  bloggerBlogsURI,
  blogURI,
  blogWebsite,
} from '../utils/constants/blogs.constants';
import { invalidURI, longString17 } from '../utils/constants/common.constants';
import { exceptionObject } from '../utils/objects/common.objects';
import {
  banReasonField,
  isBannedField,
} from '../utils/constants/exceptions.constants';
import {
  banURI,
  bloggerUsersURI,
  saUsersURI,
  user01Email,
  user01Login,
  userPassword,
} from '../utils/constants/users.constants';
import {
  basicAuthLogin,
  basicAuthPassword,
  publicLoginUri,
} from '../utils/constants/auth.constants';
import { randomUUID } from 'crypto';
import {
  blogIDField,
  userIDField,
} from '../../src/exceptions/exception.constants';
import { userBannedByBloggerObject } from '../utils/objects/users.objects';
import {
  postContent,
  postShortDescription,
  postTitle,
  publicPostsURI,
} from '../utils/constants/posts.constants';
import { postObject } from '../utils/objects/posts.objects';
import {
  commentContent,
  publicCommentsURI,
} from '../utils/constants/comments.constants';
import { getAppAndClearDb } from '../utils/functions/get-app';

describe('Blogger users ban testing', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;

  beforeAll(async () => {
    const data = await getAppAndClearDb();
    app = data.app;
    agent = data.agent;
  });

  let userId;
  let blogId;
  let postId;

  let aTokenUser01;

  describe('Users creation and authentication', () => {
    it(`should create user`, async () => {
      const user = await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user01Login,
          password: userPassword,
          email: user01Email,
        })
        .expect(201);
      userId = user.body.id;
    });
    it(`should log in user`, async () => {
      const response = await agent
        .post(publicLoginUri)
        .send({
          loginOrEmail: user01Login,
          password: userPassword,
        })
        .expect(200);
      aTokenUser01 = response.body.accessToken;
    });
  });
  describe('Blog, post and comment creation', () => {
    it(`should create blog`, async () => {
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
    it(`should create post`, async () => {
      await agent
        .post(bloggerBlogsURI + blogId + publicPostsURI)
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
        items: [postObject],
      });
    });
    it(`should create comment`, async () => {
      await agent
        .post(publicPostsURI + postId + publicCommentsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          content: commentContent,
        })
        .expect(201);
    });
  });
  describe('Ban user', () => {
    // Validation errors [400]
    it(`should return 400 when trying to ban user without isBanned`, async () => {
      const response = await agent
        .put(bloggerUsersURI + userId + banURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          banReason: randomUUID(),
          blogId: blogId,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(isBannedField));
    });
    it(`should return 400 when trying to ban user with incorrect isBanned type`, async () => {
      const response = await agent
        .put(bloggerUsersURI + userId + banURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          isBanned: 123,
          banReason: randomUUID(),
          blogId: blogId,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(isBannedField));
    });
    it(`should return 400 when trying to ban user without banReason`, async () => {
      const response = await agent
        .put(bloggerUsersURI + userId + banURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          isBanned: true,
          blogId: blogId,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(banReasonField));
    });
    it(`should return 400 when trying to ban user with incorrect banReason length`, async () => {
      const response = await agent
        .put(bloggerUsersURI + userId + banURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          isBanned: true,
          banReason: longString17,
          blogId: blogId,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(banReasonField));
    });
    it(`should return 400 when trying to ban user with incorrect userId`, async () => {
      const response = await agent
        .put(bloggerUsersURI + invalidURI + banURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          isBanned: true,
          banReason: randomUUID(),
          blogId: blogId,
        })
        .expect(404);

      expect(response.body).toEqual(exceptionObject(userIDField));
    });
    it(`should return 400 when trying to ban user with incorrect blogId`, async () => {
      const response = await agent
        .put(bloggerUsersURI + userId + banURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          isBanned: true,
          banReason: randomUUID(),
          blogId: randomUUID(),
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(blogIDField));
    });

    // Auth errors [401]
    it(`should return 401 when trying to ban user with incorrect token`, async () => {
      await agent
        .put(bloggerUsersURI + userId + banURI)
        .auth(randomUUID(), { type: 'bearer' })
        .send({
          isBanned: true,
          banReason: randomUUID(),
          blogId: blogId,
        })
        .expect(401);
    });

    // Success
    it(`should ban user`, async () => {
      return agent
        .put(bloggerUsersURI + userId + banURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          isBanned: true,
          banReason: randomUUID(),
          blogId: blogId,
        })
        .expect(204);
    });

    // Forbidden errors [403]
    it(`should return 403 when trying to create comment by banned user`, async () => {
      await agent
        .post(publicPostsURI + postId + publicCommentsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          content: commentContent,
        })
        .expect(403);
    });
  });
  describe('Get banned users', () => {
    // Auth errors [401]
    it(`should return 401 when trying to get banned users with incorrect token`, async () => {
      await agent
        .get(bloggerUsersURI + blogURI + blogId)
        .auth(randomUUID(), { type: 'bearer' })
        .expect(401);
    });

    // Success
    it(`should return empty array with login filter 000`, async () => {
      const users = await agent
        .get(bloggerUsersURI + blogURI + blogId)
        .query({ searchLoginTerm: '000' })
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(200);

      expect(users.body).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });
    it(`should return banned users with login filter 1`, async () => {
      const users = await agent
        .get(bloggerUsersURI + blogURI + blogId)
        .query({ searchLoginTerm: '1' })
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(200);

      expect(users.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [userBannedByBloggerObject],
      });
    });
  });
  describe('Unban user', () => {
    it(`should unban user`, async () => {
      return agent
        .put(bloggerUsersURI + userId + banURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          isBanned: false,
          banReason: randomUUID(),
          blogId: blogId,
        })
        .expect(204);
    });
    it(`should create comment by unbanned user`, async () => {
      await agent
        .post(publicPostsURI + postId + publicCommentsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          content: commentContent,
        })
        .expect(201);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
