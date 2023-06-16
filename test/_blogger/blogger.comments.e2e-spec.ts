import { SuperAgentTest } from 'supertest';
import { INestApplication } from '@nestjs/common';
import {
  blog01Name,
  blogDescription,
  bloggerBlogsURI,
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
import {
  postContent,
  postShortDescription,
  postTitle,
  publicPostsURI,
} from '../utils/constants/posts.constants';
import {
  bloggerCommentsURI,
  commentContent,
  publicCommentsURI,
} from '../utils/constants/comments.constants';
import { getAppAndClearDb } from '../utils/functions/get-app';

describe('Blogger comments testing', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;

  beforeAll(async () => {
    const data = await getAppAndClearDb();
    app = data.app;
    agent = data.agent;
  });

  let aTokenUser01;
  let aTokenUser02;

  let blog01Id;
  let blog02Id;

  let post01Id;
  let post02Id;

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

  describe('Create blogs, posts, comments', () => {
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
    });
    it(`should create new blog of user 02`, async () => {
      const blog = await agent
        .post(bloggerBlogsURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          name: blog01Name,
          description: blogDescription,
          websiteUrl: blogWebsite,
        })
        .expect(201);

      blog02Id = blog.body.id;
    });
    it(`should create new post of user 01`, async () => {
      const post = await agent
        .post(bloggerBlogsURI + blog01Id + publicPostsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          title: postTitle,
          shortDescription: postShortDescription,
          content: postContent,
        })
        .expect(201);

      post01Id = post.body.id;
    });
    it(`should create new post of user 02`, async () => {
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
    it(`should create new comment of user 01 for post 01`, async () => {
      await agent
        .post(publicPostsURI + post01Id + publicCommentsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          content: commentContent,
        })
        .expect(201);
    });
    it(`should create new comment of user 01 for post 02`, async () => {
      await agent
        .post(publicPostsURI + post02Id + publicCommentsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          content: commentContent,
        })
        .expect(201);
    });
    it(`should create new comment of user 02 for post 01`, async () => {
      await agent
        .post(publicPostsURI + post01Id + publicCommentsURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          content: commentContent,
        })
        .expect(201);
    });
    it(`should create new comment of user 02 for post 02`, async () => {
      await agent
        .post(publicPostsURI + post02Id + publicCommentsURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .send({
          content: commentContent,
        })
        .expect(201);
    });
    it(`should return comments of user 01`, async () => {
      const comments = await agent
        .get(bloggerBlogsURI + bloggerCommentsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .expect(200);

      expect(comments.body.items.length).toBe(2);
      expect(comments.body.items[0].postInfo.blogId).toBe(blog01Id);
      expect(comments.body.items[1].postInfo.blogId).toBe(blog01Id);
    });
    it(`should return comments of user 02`, async () => {
      const comments = await agent
        .get(bloggerBlogsURI + bloggerCommentsURI)
        .auth(aTokenUser02, { type: 'bearer' })
        .expect(200);

      expect(comments.body.items.length).toBe(2);
      expect(comments.body.items[0].postInfo.blogId).toBe(blog02Id);
      expect(comments.body.items[1].postInfo.blogId).toBe(blog02Id);
    });
  });
  afterAll(async () => {
    await app.close();
  });
});
