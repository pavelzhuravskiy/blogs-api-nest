import { SuperAgentTest } from 'supertest';
import { INestApplication } from '@nestjs/common';
import {
  banURI,
  saUsersURI,
  user01Email,
  user01Login,
  user02Email,
  user02Login,
  user03Email,
  user03Login,
  user04Email,
  user04Login,
  userPassword,
} from '../utils/constants/users.constants';
import {
  basicAuthLogin,
  basicAuthPassword,
  publicLoginUri,
} from '../utils/constants/auth.constants';
import { exceptionObject } from '../utils/objects/common.objects';
import {
  longString17,
  longString39,
} from '../utils/constants/common.constants';
import { randomUUID } from 'crypto';
import {
  banReasonField,
  emailField,
  isBannedField,
  loginField,
  passwordField,
} from '../utils/constants/exceptions.constants';
import {
  blog01Name,
  blog02Name,
  blogDescription,
  bloggerBlogsURI,
  blogWebsite,
} from '../utils/constants/blogs.constants';
import {
  postContent,
  postShortDescription,
  postTitle,
  publicPostsURI,
} from '../utils/constants/posts.constants';
import {
  commentContent,
  publicCommentsURI,
} from '../utils/constants/comments.constants';
import { publicLikesURI } from '../utils/constants/likes.constants';
import { LikeStatus } from '../../src/enums/like-status.enum';
import { userObject } from '../utils/objects/users.objects';
import { getAppAndClearDb } from '../utils/functions/get-app';

describe('Super admin users testing', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;

  beforeAll(async () => {
    const data = await getAppAndClearDb();
    app = data.app;
    agent = data.agent;
  });

  let blog01Id;
  let blog02Id;

  let post02Id;

  let comment03Id;

  let user01Id;

  let aTokenUser01;
  let aTokenUser02;
  let aTokenUser03;

  describe('Users create and authenticate', () => {
    // Validation errors [400]
    it(`should return 400 when trying to create user without login`, async () => {
      const response = await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          password: userPassword,
          email: user01Email,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(loginField));
    });
    it(`should return 400 when trying to create user without password`, async () => {
      const response = await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user01Login,
          email: user01Email,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(passwordField));
    });
    it(`should return 400 when trying to create user without email`, async () => {
      const response = await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user01Login,
          password: userPassword,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(emailField));
    });
    it(`should return 400 when trying to create user with incorrect login type`, async () => {
      const response = await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: 123,
          password: userPassword,
          email: user01Email,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(loginField));
    });
    it(`should return 400 when trying to create user with incorrect password type`, async () => {
      const response = await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user01Login,
          password: 123,
          email: user01Email,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(passwordField));
    });
    it(`should return 400 when trying to create user with incorrect email type`, async () => {
      const response = await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user01Login,
          password: userPassword,
          email: randomUUID(),
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(emailField));
    });
    it(`should return 400 when trying to create user with incorrect login length`, async () => {
      const response = await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: longString17,
          password: userPassword,
          email: user01Email,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(loginField));
    });
    it(`should return 400 when trying to create user with incorrect password length`, async () => {
      const response = await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user01Login,
          password: longString39,
          email: user01Email,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(passwordField));
    });

    // Auth errors [401]
    it(`should return 401 when trying to create user with incorrect credentials`, async () => {
      return agent
        .post(saUsersURI)
        .auth(basicAuthLogin, randomUUID())
        .send({
          login: user01Login,
          password: userPassword,
          email: user01Email,
        })
        .expect(401);
    });

    // Success
    it(`should create three users`, async () => {
      const user01 = await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user01Login,
          password: userPassword,
          email: user01Email,
        })

        .expect(201);

      expect(user01.body).toEqual(userObject);

      user01Id = user01.body.id;

      await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user02Login,
          password: userPassword,
          email: user02Email,
        })
        .expect(201);

      await agent
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

    // Unique values validation errors [400]
    it(`should return 400 when trying to create user with login that already exists`, async () => {
      const response = await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user01Login,
          password: userPassword,
          email: user04Email,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(loginField));
    });
    it(`should return 400 when trying to create user with email that already exists`, async () => {
      const response = await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user04Login,
          password: userPassword,
          email: user01Email,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(emailField));
    });
  });
  describe('Ban user', () => {
    it(`should create blog by user 01`, async () => {
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
    });
    it(`should create post by user 01`, async () => {
      await agent
        .post(bloggerBlogsURI + blog01Id + publicPostsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          title: postTitle,
          shortDescription: postShortDescription,
          content: postContent,
        })
        .expect(201);
    });
    it(`should create blog by user 02`, async () => {
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
    });
    it(`should create post by user 02`, async () => {
      const post = await agent
        .post(bloggerBlogsURI + blog02Id + publicPostsURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          title: postTitle,
          shortDescription: postShortDescription,
          content: postContent,
        })
        .expect(201);
      post02Id = post.body.id;
    });
    it('should like post of user 02 by user 01', async () => {
      return agent
        .put(publicPostsURI + post02Id + publicLikesURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.Like,
        })
        .expect(204);
    });
    it('should like post of user 02 by user 03', async () => {
      return agent
        .put(publicPostsURI + post02Id + publicLikesURI)
        .auth(aTokenUser03, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.Like,
        })
        .expect(204);
    });
    it('should return two posts and count user 02 post likes', async () => {
      const posts = await agent.get(publicPostsURI).expect(200);
      expect(posts.body.items).toHaveLength(2);
      expect(posts.body.items[0].extendedLikesInfo.newestLikes).toHaveLength(2);
    });
    it(`should create comment by user 01 for post 02`, async () => {
      await agent
        .post(publicPostsURI + post02Id + publicCommentsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          content: commentContent,
        })
        .expect(201);
    });
    it(`should create comment by user 03 for post 02`, async () => {
      const comment = await agent
        .post(publicPostsURI + post02Id + publicCommentsURI)
        .auth(aTokenUser03, { type: 'bearer' })
        .send({
          content: commentContent,
        })
        .expect(201);
      comment03Id = comment.body.id;
    });
    it('should dislike comment of user 03 by user 01', async () => {
      return agent
        .put(publicCommentsURI + comment03Id + publicLikesURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          likeStatus: LikeStatus.Dislike,
        })
        .expect(204);
    });
    it('should return two comments and count user 03 comment dislikes', async () => {
      const comments = await agent
        .get(publicPostsURI + post02Id + publicCommentsURI)
        .expect(200);

      expect(comments.body.items).toHaveLength(2);
      expect(comments.body.items[0].likesInfo.dislikesCount).toBe(1);
    });

    // Validation errors [400]
    it(`should return 400 when trying to ban user without isBanned`, async () => {
      const response = await agent
        .put(saUsersURI + user01Id + banURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          banReason: randomUUID(),
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(isBannedField));
    });
    it(`should return 400 when trying to ban user with incorrect isBanned type`, async () => {
      const response = await agent
        .put(saUsersURI + user01Id + banURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          isBanned: randomUUID(),
          banReason: randomUUID(),
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(isBannedField));
    });
    it(`should return 400 when trying to ban user without banReason`, async () => {
      const response = await agent
        .put(saUsersURI + user01Id + banURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          isBanned: true,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(banReasonField));
    });
    it(`should return 400 when trying to ban user with incorrect banReason length`, async () => {
      const response = await agent
        .put(saUsersURI + user01Id + banURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          isBanned: true,
          banReason: longString17,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(banReasonField));
    });

    // Success
    it(`should ban user 01`, async () => {
      await agent
        .put(saUsersURI + user01Id + banURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          isBanned: true,
          banReason: randomUUID(),
        })
        .expect(204);
    });
    it(`should return 401 when banned user is trying to log in`, async () => {
      await agent
        .post(publicLoginUri)
        .send({
          loginOrEmail: user01Login,
          password: userPassword,
        })
        .expect(401);
    });
    it('should hide post of banned user and hide like for post of user 03', async () => {
      const posts = await agent.get(publicPostsURI).expect(200);
      expect(posts.body.items).toHaveLength(1);
      expect(posts.body.items[0].extendedLikesInfo.newestLikes).toHaveLength(1);
      expect(posts.body.items[0].extendedLikesInfo.likesCount).toBe(1);
      expect(posts.body.items[0].extendedLikesInfo.newestLikes[0].login).toBe(
        user03Login,
      );
    });
    it('should hide comment of banned user for post of user 02', async () => {
      const comments = await agent
        .get(publicPostsURI + post02Id + publicCommentsURI)
        .expect(200);

      expect(comments.body.items).toHaveLength(1);
      expect(comments.body.items[0].commentatorInfo.userLogin).toBe(
        user03Login,
      );
    });
    it('should hide dislike of banned user for comment of user 03', async () => {
      const comment = await agent
        .get(publicCommentsURI + comment03Id)
        .expect(200);

      expect(comment.body.likesInfo.dislikesCount).toBe(0);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
