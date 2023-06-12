import supertest, { SuperAgentTest } from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import {
  blog01Name,
  blogDescription,
  bloggerBlogsURI,
  blogWebsite,
  publicBlogsURI,
} from '../utils/constants/blogs.constants';
import { testingAllDataURI } from '../utils/constants/testing.constants';
import { customExceptionFactory } from '../../src/exceptions/exception.factory';
import { HttpExceptionFilter } from '../../src/exceptions/exception.filter';
import { AppModule } from '../../src/app.module';
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
import { useContainer } from 'class-validator';
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

describe('Comments sorting, pagination', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        stopAtFirstError: true,
        exceptionFactory: customExceptionFactory,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
    agent = supertest.agent(app.getHttpServer());

    await agent.delete(testingAllDataURI);
  });

  let aTokenUser01;

  let blogId;
  let postId;

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
  it(`should create blog`, async () => {
    await agent
      .post(bloggerBlogsURI)
      .auth(aTokenUser01, { type: 'bearer' })
      .send({
        name: blog01Name,
        description: blogDescription,
        websiteUrl: blogWebsite,
      })
      .expect(201);

    const blogs = await agent.get(publicBlogsURI).expect(200);

    blogId = blogs.body.items[0].id;
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
  });
  it(`should create 10 comments`, async () => {
    for (let i = 0; i < 10; i++) {
      await agent
        .post(publicPostsURI + postId + publicCommentsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          content: `${commentContent} 0${i}`,
        })
        .expect(201);
    }

    const comments = await agent
      .get(publicPostsURI + postId + publicCommentsURI)
      .expect(200);

    expect(comments.body.items).toHaveLength(10);
  }, 30000);
  it(`should sort comments by date (desc)`, async () => {
    const comments = await agent
      .get(publicPostsURI + postId + publicCommentsURI)
      .expect(200);

    expect(comments.body.items[0].content).toBe(`${commentContent} 09`);
    expect(comments.body.items[1].content).toBe(`${commentContent} 08`);
    expect(comments.body.items[2].content).toBe(`${commentContent} 07`);
    expect(comments.body.items[3].content).toBe(`${commentContent} 06`);
    expect(comments.body.items[4].content).toBe(`${commentContent} 05`);
    expect(comments.body.items[5].content).toBe(`${commentContent} 04`);
    expect(comments.body.items[6].content).toBe(`${commentContent} 03`);
    expect(comments.body.items[7].content).toBe(`${commentContent} 02`);
    expect(comments.body.items[8].content).toBe(`${commentContent} 01`);
    expect(comments.body.items[9].content).toBe(`${commentContent} 00`);
  });
  it(`should sort comments by content (asc)`, async () => {
    const comments = await agent
      .get(publicPostsURI + postId + publicCommentsURI)
      .query({ sortBy: 'content', sortDirection: 'asc' })
      .expect(200);

    expect(comments.body.items[0].content).toBe(`${commentContent} 00`);
    expect(comments.body.items[1].content).toBe(`${commentContent} 01`);
    expect(comments.body.items[2].content).toBe(`${commentContent} 02`);
    expect(comments.body.items[3].content).toBe(`${commentContent} 03`);
    expect(comments.body.items[4].content).toBe(`${commentContent} 04`);
    expect(comments.body.items[5].content).toBe(`${commentContent} 05`);
    expect(comments.body.items[6].content).toBe(`${commentContent} 06`);
    expect(comments.body.items[7].content).toBe(`${commentContent} 07`);
    expect(comments.body.items[8].content).toBe(`${commentContent} 08`);
    expect(comments.body.items[9].content).toBe(`${commentContent} 09`);
  });
  it(`should return correct pagination output`, async () => {
    const comments = await agent
      .get(publicPostsURI + postId + publicCommentsURI)
      .query({ pageNumber: '2', pageSize: '5' })
      .expect(200);

    expect(comments.body.pagesCount).toBe(2);
    expect(comments.body.page).toBe(2);
    expect(comments.body.pageSize).toBe(5);
    expect(comments.body.totalCount).toBe(10);
    expect(comments.body.items).toHaveLength(5);
    expect(comments.body.items[0].content).toBe(`${commentContent} 04`);
  });

  afterAll(async () => {
    await app.close();
  });
});
