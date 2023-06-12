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

describe('Blogs filtering, sorting, pagination', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.enableCors();
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
  it(`should create 10 blogs`, async () => {
    for (let i = 1, j = 42; i < 6; i++, j--) {
      await agent
        .post(bloggerBlogsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          name: `${blog01Name} 0${i}`,
          description: `${j} ${blogDescription}`,
          websiteUrl: blogWebsite,
        })
        .expect(201);
    }
    for (let i = 3, j = 99; i < 8; i++, j--) {
      await agent
        .post(bloggerBlogsURI)
        .auth(aTokenUser01, { type: 'bearer' })
        .send({
          name: `${blog01Name} 1${i}`,
          description: `${j} ${blogDescription}`,
          websiteUrl: blogWebsite,
        })
        .expect(201);
    }
    const blogs = await agent.get(publicBlogsURI).expect(200);
    expect(blogs.body.items).toHaveLength(10);
  });
  it(`should filter blogs by term`, async () => {
    const blogs = await agent
      .get(publicBlogsURI)
      .query({ searchNameTerm: '3' })
      .expect(200);

    expect(blogs.body.items).toHaveLength(2);
    expect(blogs.body.items[0].name).toBe(`${blog01Name} 13`);
    expect(blogs.body.items[1].name).toBe(`${blog01Name} 03`);
  });
  it(`should sort blogs by date (desc)`, async () => {
    const blogs = await agent.get(publicBlogsURI).expect(200);

    expect(blogs.body.items[0].name).toBe(`${blog01Name} 17`);
    expect(blogs.body.items[1].name).toBe(`${blog01Name} 16`);
    expect(blogs.body.items[2].name).toBe(`${blog01Name} 15`);
    expect(blogs.body.items[3].name).toBe(`${blog01Name} 14`);
    expect(blogs.body.items[4].name).toBe(`${blog01Name} 13`);
    expect(blogs.body.items[5].name).toBe(`${blog01Name} 05`);
    expect(blogs.body.items[6].name).toBe(`${blog01Name} 04`);
    expect(blogs.body.items[7].name).toBe(`${blog01Name} 03`);
    expect(blogs.body.items[8].name).toBe(`${blog01Name} 02`);
    expect(blogs.body.items[9].name).toBe(`${blog01Name} 01`);
  });
  it(`should sort blogs by description (asc)`, async () => {
    const blogs = await agent
      .get(publicBlogsURI)
      .query({ sortBy: 'description', sortDirection: 'asc' })
      .expect(200);

    expect(blogs.body.items[0].description).toBe(`38 ${blogDescription}`);
    expect(blogs.body.items[1].description).toBe(`39 ${blogDescription}`);
    expect(blogs.body.items[2].description).toBe(`40 ${blogDescription}`);
    expect(blogs.body.items[3].description).toBe(`41 ${blogDescription}`);
    expect(blogs.body.items[4].description).toBe(`42 ${blogDescription}`);
    expect(blogs.body.items[5].description).toBe(`95 ${blogDescription}`);
    expect(blogs.body.items[6].description).toBe(`96 ${blogDescription}`);
    expect(blogs.body.items[7].description).toBe(`97 ${blogDescription}`);
    expect(blogs.body.items[8].description).toBe(`98 ${blogDescription}`);
    expect(blogs.body.items[9].description).toBe(`99 ${blogDescription}`);
  });
  it(`should return correct pagination output`, async () => {
    const blogs = await agent
      .get(publicBlogsURI)
      .query({ pageNumber: '2', pageSize: '5' })
      .expect(200);

    expect(blogs.body.pagesCount).toBe(2);
    expect(blogs.body.page).toBe(2);
    expect(blogs.body.pageSize).toBe(5);
    expect(blogs.body.totalCount).toBe(10);
    expect(blogs.body.items).toHaveLength(5);
    expect(blogs.body.items[0].name).toBe(`${blog01Name} 05`);
  });

  afterAll(async () => {
    await app.close();
  });
});
