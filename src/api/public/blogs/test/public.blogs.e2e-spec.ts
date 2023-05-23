import supertest, { SuperAgentTest } from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  blog01Name,
  blogDescription,
  bloggerBlogsURI,
  blogWebsite,
  publicBlogsURI,
} from '../../../../../test/constants/blogs.constants';
import { testingURI } from '../../../../../test/constants/testing.constants';
import { customExceptionFactory } from '../../../../exceptions/exception.factory';
import { HttpExceptionFilter } from '../../../../exceptions/exception.filter';
import { AppModule } from '../../../../app.module';
import {
  user01Email,
  user01Login,
  userPassword,
  saUsersURI,
} from '../../../../../test/constants/users.constants';
import {
  basicAuthLogin,
  basicAuthPassword,
  loginUri,
} from '../../../../../test/constants/auth.constants';
import { useContainer } from 'class-validator';

describe('Blogs testing', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(process.env.TEST_URI || ''),
        AppModule,
      ],
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
  });

  let aTokenUser01;

  describe('Blogs CRUD operations', () => {
    beforeAll(async () => await agent.delete(testingURI));

    describe('Blogs filtering, sorting, pagination', () => {
      beforeAll(async () => await agent.delete(testingURI));

      // Create and login users
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
          .post(loginUri)
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
        const check = await agent.get(publicBlogsURI).expect(200);
        expect(check.body.items).toHaveLength(10);
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
    });

    /*it(`should return blog by ID`, async () => {
      const blogs = await agent.get(publicBlogsURI).expect(200);
      blog01Id = blogs.body.items[0].id;

      const blog = await agent.get(publicBlogsURI + blog01Id).expect(200);
      expect(blog.body).toEqual(blog01Object);
    });*/

    /*
    it(`should return 404 when trying to get nonexistent blog`, async () => {
      return agent.get(publicBlogsURI + invalidURI).expect(404);
    });*/
  });

  afterAll(async () => {
    await app.close();
  });
});
