import { SuperAgentTest } from 'supertest';
import { INestApplication } from '@nestjs/common';
import {
  blog01Name,
  blogDescription,
  bloggerBlogsURI,
  blogWebsite,
  publicBlogsURI,
} from '../utils/constants/blogs.constants';
import {
  postContent,
  postShortDescription,
  postTitle,
  publicPostsURI,
} from '../utils/constants/posts.constants';
import {
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
import { getAppAndClearDb } from '../utils/functions/get-app';

describe('Posts filtering, sorting, pagination', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;

  beforeAll(async () => {
    const data = await getAppAndClearDb();
    app = data.app;
    agent = data.agent;
  });

  let aTokenUser01;
  let blog01Id;
  let blog02Id;

  it(`should create user`, async () => {
    await agent
      .post(saUsersURI)
      .auth(basicAuthLogin, basicAuthPassword)
      .send({
        login: user01Login,
        password: userPassword,
        email: user01Email,
      })
      .expect(201);
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
  it(`should create two blogs`, async () => {
    for (let i = 0; i < 2; i++) {
      await agent
        .post(bloggerBlogsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          name: blog01Name,
          description: blogDescription,
          websiteUrl: blogWebsite,
        })
        .expect(201);
    }
  });
  it(`should create 10 posts`, async () => {
    const blogs = await agent.get(publicBlogsURI).expect(200);
    blog01Id = blogs.body.items[0].id;
    blog02Id = blogs.body.items[1].id;

    for (let i = 1, j = 42; i < 6; i++, j--) {
      await agent
        .post(bloggerBlogsURI + blog01Id + publicPostsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          title: `${postTitle} 0${i}`,
          shortDescription: `${j} ${postShortDescription}`,
          content: postContent,
        })
        .expect(201);
    }
    for (let i = 3, j = 99; i < 8; i++, j--) {
      await agent
        .post(bloggerBlogsURI + blog02Id + publicPostsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          title: `${postTitle} 1${i}`,
          shortDescription: `${j} ${postShortDescription}`,
          content: postContent,
        })
        .expect(201);
    }
    const posts = await agent.get(publicPostsURI).expect(200);
    expect(posts.body.items).toHaveLength(10);
  });
  it(`should filter posts by blog`, async () => {
    const posts = await agent
      .get(publicBlogsURI + blog01Id + publicPostsURI)
      .expect(200);
    expect(posts.body.items).toHaveLength(5);
  });
  it(`should sort posts by date (desc)`, async () => {
    const posts = await agent.get(publicPostsURI).expect(200);

    expect(posts.body.items[0].title).toBe(`${postTitle} 17`);
    expect(posts.body.items[1].title).toBe(`${postTitle} 16`);
    expect(posts.body.items[2].title).toBe(`${postTitle} 15`);
    expect(posts.body.items[3].title).toBe(`${postTitle} 14`);
    expect(posts.body.items[4].title).toBe(`${postTitle} 13`);
    expect(posts.body.items[5].title).toBe(`${postTitle} 05`);
    expect(posts.body.items[6].title).toBe(`${postTitle} 04`);
    expect(posts.body.items[7].title).toBe(`${postTitle} 03`);
    expect(posts.body.items[8].title).toBe(`${postTitle} 02`);
    expect(posts.body.items[9].title).toBe(`${postTitle} 01`);
  });
  it(`should sort posts by short description (asc)`, async () => {
    const posts = await agent
      .get(publicPostsURI)
      .query({ sortBy: 'shortDescription', sortDirection: 'asc' })
      .expect(200);

    expect(posts.body.items[0].shortDescription).toBe(
      `38 ${postShortDescription}`,
    );
    expect(posts.body.items[1].shortDescription).toBe(
      `39 ${postShortDescription}`,
    );
    expect(posts.body.items[2].shortDescription).toBe(
      `40 ${postShortDescription}`,
    );
    expect(posts.body.items[3].shortDescription).toBe(
      `41 ${postShortDescription}`,
    );
    expect(posts.body.items[4].shortDescription).toBe(
      `42 ${postShortDescription}`,
    );
    expect(posts.body.items[5].shortDescription).toBe(
      `95 ${postShortDescription}`,
    );
    expect(posts.body.items[6].shortDescription).toBe(
      `96 ${postShortDescription}`,
    );
    expect(posts.body.items[7].shortDescription).toBe(
      `97 ${postShortDescription}`,
    );
    expect(posts.body.items[8].shortDescription).toBe(
      `98 ${postShortDescription}`,
    );
    expect(posts.body.items[9].shortDescription).toBe(
      `99 ${postShortDescription}`,
    );
  });
  it(`should return correct pagination output`, async () => {
    const posts = await agent
      .get(publicPostsURI)
      .query({ pageNumber: '2', pageSize: '5' })
      .expect(200);

    expect(posts.body.pagesCount).toBe(2);
    expect(posts.body.page).toBe(2);
    expect(posts.body.pageSize).toBe(5);
    expect(posts.body.totalCount).toBe(10);
    expect(posts.body.items).toHaveLength(5);
    expect(posts.body.items[0].title).toBe(`${postTitle} 05`);
  });

  afterAll(async () => {
    await app.close();
  });
});
