import supertest, { SuperAgentTest } from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { useContainer } from 'class-validator';
import { AppModule } from '../../src/app.module';
import { customExceptionFactory } from '../../src/exceptions/exception.factory';
import { HttpExceptionFilter } from '../../src/exceptions/exception.filter';
import { testingURI } from '../utils/constants/testing.constants';
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
  loginUri,
} from '../utils/constants/auth.constants';
import { exceptionObject } from '../utils/objects/common.objects';
import {
  longString17,
  longString39,
} from '../utils/constants/common.constants';
import { randomUUID } from 'crypto';
import {
  emailField,
  loginField,
  passwordField,
} from '../utils/constants/exceptions.constants';
import {
  blog01Name,
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
import { postObject } from '../utils/objects/posts.objects';

describe('Super admin users testing', () => {
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

    await agent.delete(testingURI);
  });

  let blogId;
  let postId;

  let user01Id;
  let user02Id;

  let aTokenUser01;
  let aTokenUser02;

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

    // Success [201]
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
        .post(loginUri)
        .send({
          loginOrEmail: user01Login,
          password: userPassword,
        })
        .expect(200);

      const users = await agent
        .get(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword);

      user01Id = users.body.items[1].id;
      aTokenUser01 = response.body.accessToken;
    });
    it(`should log in user 02`, async () => {
      const response = await agent
        .post(loginUri)
        .send({
          loginOrEmail: user02Login,
          password: userPassword,
        })
        .expect(200);
      aTokenUser02 = response.body.accessToken;
    });

    // Unique values validation errors [400]
    it(`should return 400 when trying to create user with login that already exists`, async () => {
      const response = await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user01Login,
          password: userPassword,
          email: user03Email,
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(loginField));
    });
    it(`should return 400 when trying to create user with email that already exists`, async () => {
      const response = await agent
        .post(saUsersURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: user03Login,
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

      blogId = blog.body.id;
    });
    it(`should create post by user 01`, async () => {
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

    // Validation errors [400]
    it(`should return 400 when trying to ban user with incorrect isBanned type`, async () => {
      /*
      const response = await agent
        .post(saUsersURI + user01Id + userBanURI)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          isBanned: randomUUID(),
          banReason: randomUUID(),
        })
        .expect(400);

      expect(response.body).toEqual(exceptionObject(isBannedField));*/
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
